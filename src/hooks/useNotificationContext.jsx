"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const NotificationContext = createContext(null);

export function NotificationProvider({ children, role: initialRole = null, userId: initialUserId = null }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [activeRole, setActiveRole] = useState(initialRole);
  const [activeUserId, setActiveUserId] = useState(initialUserId);
  const socketRef = useRef(null);

  // Auto-detect role and userId from session if not provided
  useEffect(() => {
    if (initialRole) setActiveRole(initialRole);
    if (initialUserId) setActiveUserId(initialUserId);

    if (!initialRole || !initialUserId) {
      let isMounted = true;
      fetch("/api/auth/session")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted || !data?.user) return;
          if (!initialRole && data.user.role) setActiveRole(data.user.role);
          if (!initialUserId && (data.user.id || data.user.vendor_id)) {
            setActiveUserId(data.user.id || data.user.vendor_id);
          }
        })
        .catch(() => {
          // Fallback to verify-vendor
          fetch("/api/proxy/auth/verify-vendor")
            .then((r) => (r.ok ? r.json() : null))
            .then((vData) => {
              if (!isMounted || !vData?.authenticated) return;
              if (!initialRole && vData.role) setActiveRole(vData.role);
              if (!initialUserId && vData.id) setActiveUserId(vData.id);
            })
            .catch(() => {});
        });

      return () => {
        isMounted = false;
      };
    }
  }, [initialRole, initialUserId]);

  // Fetch notifications from server using unified endpoint
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/notifications?limit=50");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data || []);
          setUnreadCount(json.unreadCount || 0);
          return;
        }
      }
      // Backward compatibility fallback for super-admin if needed
      if (activeRole === "super_admin" || activeRole === "admin") {
        const legacyRes = await fetch("/api/proxy/admin/notifications?limit=50");
        if (legacyRes.ok) {
          const json = await legacyRes.json();
          if (json.success) {
            setNotifications(json.data || []);
            setUnreadCount(json.unreadCount || 0);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch notifications:", err);
    }
  }, [activeRole]);

  // Initialize socket connection
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const socket = io(backendUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      const normalizedRole = (activeRole || "").toLowerCase().replace(/\s+/g, "_");

      if (normalizedRole === "super_admin" || normalizedRole === "admin") {
        socket.emit("join_super_admin");
      }
      if (normalizedRole) {
        socket.emit("join_role", normalizedRole);
      }
      if (activeUserId) {
        socket.emit("join_user", activeUserId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for incoming targeted notification
    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
      setUnreadCount((prev) => prev + 1);
      setLastEvent({ type: "new_notification", data: notif, timestamp: Date.now() });

      // Trigger customized toast alert based on notification type
      const title = notif.title || "Notification";
      const message = notif.message || "";
      if (notif.type === "PAYMENT_SUCCESS" || notif.type === "ORDER_PAID") {
        toast.success(`💳 ${title}: ${message}`, { autoClose: 7000, onClick: () => setIsOpen(true) });
      } else if (notif.type === "ACCOUNT_APPROVED") {
        toast.success(`🎉 ${title}: ${message}`, { autoClose: 8000, onClick: () => setIsOpen(true) });
      } else if (notif.type === "ACCOUNT_REJECTED") {
        toast.error(`⚠️ ${title}: ${message}`, { autoClose: 8000, onClick: () => setIsOpen(true) });
      } else if (notif.type === "PROGRAM_ENROLLMENT" || notif.type === "ENROLLMENT_VERIFIED") {
        toast.info(`🌾 ${title}: ${message}`, { autoClose: 7000, onClick: () => setIsOpen(true) });
      } else {
        toast.info(`🔔 ${title}: ${message}`, { autoClose: 6000, onClick: () => setIsOpen(true) });
      }
    });

    // System-wide notification dispatch sync
    socket.on("system_notification_dispatched", (meta) => {
      const normalizedRole = (activeRole || "").toLowerCase().replace(/\s+/g, "_");
      if (
        meta?.recipient_role === "all" ||
        meta?.recipient_role === normalizedRole ||
        (meta?.recipient_id && meta?.recipient_id === activeUserId)
      ) {
        fetchNotifications();
      }
    });

    // Legacy user_resubmitted event
    socket.on("user_resubmitted", (data) => {
      setLastEvent({ type: "user_resubmitted", data, timestamp: Date.now() });
      if (activeRole === "super_admin" || activeRole === "admin") {
        toast.warning(
          `📄 ${data.name || "A user"} (${data.role || "farmer"}) has resubmitted their onboarding documents!`,
          {
            autoClose: 8000,
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = "/dashboard/super-admin/users";
              }
            },
          }
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeRole, activeUserId, fetchNotifications]);

  // Initial load & periodic background sync
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 45000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`/api/proxy/notifications/${id}/read`, {
        method: "PATCH",
      });
    } catch (e) {
      console.warn("Error marking notification read:", e);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await fetch("/api/proxy/notifications/read-all", {
        method: "PATCH",
      });
      toast.success("All notifications marked as read");
    } catch (e) {
      console.warn("Error marking all read:", e);
    }
  };

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        isConnected,
        lastEvent,
        role: activeRole,
        userId: activeUserId,
        setIsOpen,
        toggleDrawer,
        openDrawer,
        closeDrawer,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      isConnected: false,
      lastEvent: null,
      role: null,
      userId: null,
      setIsOpen: () => {},
      toggleDrawer: () => {},
      openDrawer: () => {},
      closeDrawer: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      refreshNotifications: () => {},
    };
  }
  return context;
}
