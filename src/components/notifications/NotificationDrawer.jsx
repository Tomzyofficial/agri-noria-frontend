"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bell,
  CheckCheck,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  CreditCard,
  Sprout,
  FileSpreadsheet,
  ExternalLink,
  Inbox,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotificationContext";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NotificationDrawer() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isOpen,
    isConnected,
    role,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'activities', 'verifications'

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.is_read;
    if (activeTab === "activities") {
      return (
        item.type === "PAYMENT_SUCCESS" ||
        item.type === "PAYMENT_RECEIVED" ||
        item.type === "ORDER_PAID" ||
        item.type === "PROGRAM_ENROLLMENT" ||
        item.type === "ENROLLMENT_VERIFIED" ||
        item.type === "ENROLLMENT_REJECTED" ||
        item.type === "FARMER_IMPORT_COMPLETED"
      );
    }
    if (activeTab === "verifications") {
      return (
        item.type === "ONBOARDING_RESUBMISSION" ||
        item.type === "KYC_PENDING" ||
        item.type === "VERIFICATION_REJECTED" ||
        item.type === "ACCOUNT_APPROVED" ||
        item.type === "ACCOUNT_REJECTED"
      );
    }
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
      case "PAYMENT_RECEIVED":
      case "ORDER_PAID":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      case "PROGRAM_ENROLLMENT":
      case "ENROLLMENT_VERIFIED":
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
        );
      case "FARMER_IMPORT_COMPLETED":
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        );
      case "ONBOARDING_RESUBMISSION":
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
          </div>
        );
      case "ACCOUNT_APPROVED":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      case "ACCOUNT_REJECTED":
      case "ENROLLMENT_REJECTED":
      case "VERIFICATION_REJECTED":
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleActionClick = (notif) => {
    markAsRead(notif.id);
    closeDrawer();

    const normalizedRole = (role || "").toLowerCase();

    // Payments
    if (notif.type === "PAYMENT_SUCCESS" || notif.type === "ORDER_PAID") {
      if (normalizedRole === "farmer") {
        router.push("/ecosystem/farmer/wallet");
        return;
      }
      if (normalizedRole === "buyer") {
        router.push("/dashboard/buyer");
        return;
      }
    }

    // Programs
    if (
      notif.type === "PROGRAM_ENROLLMENT" ||
      notif.type === "ENROLLMENT_VERIFIED" ||
      notif.type === "ENROLLMENT_REJECTED"
    ) {
      if (["institution", "government", "finance", "dfi"].includes(normalizedRole)) {
        router.push("/ecosystem/institution/programs");
        return;
      }
      if (normalizedRole === "farmer") {
        router.push("/ecosystem/farmer/programs");
        return;
      }
      if (["super_admin", "admin"].includes(normalizedRole)) {
        router.push("/dashboard/super-admin/field-operations");
        return;
      }
    }

    // Farmer CSV Imports
    if (notif.type === "FARMER_IMPORT_COMPLETED") {
      if (["institution", "government", "finance"].includes(normalizedRole)) {
        router.push("/ecosystem/institution/farmers");
        return;
      }
      if (["super_admin", "admin"].includes(normalizedRole)) {
        router.push("/dashboard/super-admin/users?tab=pending");
        return;
      }
    }

    // Verifications / Approvals
    if (notif.metadata?.userId || notif.type === "ONBOARDING_RESUBMISSION") {
      if (["super_admin", "admin"].includes(normalizedRole)) {
        router.push("/dashboard/super-admin/users?tab=pending");
        return;
      }
      if (normalizedRole === "farmer") {
        router.push("/ecosystem/farmer/settings");
        return;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white dark:bg-gray-950 shadow-2xl border-l border-slate-200/80 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-gray-900 bg-slate-50/50 dark:bg-gray-900/40 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Ecosystem Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
                        {unreadCount} new
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      {isConnected ? "Realtime Socket Live" : "Connecting..."}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-900 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Bar & Tabs */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-gray-900 p-1 rounded-xl text-[11px] font-bold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTab === "all"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTab === "unread"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("activities")}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTab === "activities"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Activities
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("verifications")}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                    activeTab === "verifications"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-gray-400 hover:text-gray-800"
                  }`}
                >
                  Verifications
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notification List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-900">
            {filteredNotifications.length === 0 ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-gray-900 flex items-center justify-center text-slate-400">
                  <Inbox className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {activeTab === "unread" ? "No unread alerts" : "No notifications at this time"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs">
                    You'll be alerted in real time whenever payments, enrollments, verification actions, or platform events occur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshNotifications}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-900 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Feed</span>
                </button>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isResubmission = notif.type === "ONBOARDING_RESUBMISSION";
                return (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 transition flex items-start gap-3.5 hover:bg-slate-50/70 dark:hover:bg-gray-900/50 ${
                      !notif.is_read
                        ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-l-3 border-emerald-500"
                        : ""
                    }`}
                  >
                    {getNotificationIcon(notif.type)}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {notif.title}
                          </p>
                          {isResubmission && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                              Revision
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.metadata?.rejection_reason && (
                        <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                          <span className="font-bold">Reason: </span>
                          <span className="italic">"{notif.metadata.rejection_reason}"</span>
                        </div>
                      )}

                      {/* Action & Read Toggle */}
                      <div className="flex items-center justify-between pt-1">
                        {notif.type === "PAYMENT_SUCCESS" ||
                        notif.type === "ORDER_PAID" ||
                        notif.type === "PROGRAM_ENROLLMENT" ||
                        notif.type === "FARMER_IMPORT_COMPLETED" ||
                        isResubmission ||
                        notif.metadata?.userId ? (
                          <button
                            type="button"
                            onClick={() => handleActionClick(notif)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:underline cursor-pointer"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span />
                        )}

                        {!notif.is_read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 transition cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-gray-900 bg-slate-50/80 dark:bg-gray-900/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span className="font-mono text-[10px]">Agri-Noria Realtime Event Gateway</span>
            <button
              type="button"
              onClick={closeDrawer}
              className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
