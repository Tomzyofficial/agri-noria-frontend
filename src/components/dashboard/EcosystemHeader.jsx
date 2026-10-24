"use client";

import React from "react";
import { Bell, Menu, Sparkles, User, ShieldCheck } from "lucide-react";
import { FaSeedling } from "react-icons/fa6";
import { useNotifications } from "@/hooks/useNotificationContext";

export function EcosystemHeader({
  title = "Ecosystem Portal",
  portalName = "Ecosystem",
  role = "",
  user = null,
  onMenuToggle,
  children,
}) {
  const { unreadCount, toggleDrawer, isConnected } = useNotifications();

  // Role display formatter
  const formattedRole = (role || "").toLowerCase().replace(/_/g, " ");
  const displayName = user?.fname
    ? `${user.fname} ${user.lname || ""}`.trim()
    : user?.name || formattedRole || "User";

  return (
    <header className="ecosystem-header sticky top-0 z-30 flex items-center justify-between h-16 w-full px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 border-b border-slate-200/80 dark:border-gray-800/80 shadow-xs shrink-0">
      {/* Left: Mobile hamburger + Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-900 transition cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shrink-0 shadow-2xs">
            <FaSeedling className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5 text-xs min-w-0">
            <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 hidden sm:inline shrink-0">
              Agri-Noria
            </span>
            <span className="text-slate-300 dark:text-gray-700 font-light hidden sm:inline shrink-0">/</span>
            <span className="text-xs font-black text-gray-800 dark:text-gray-200 truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              {title}
            </span>
          </div>

          {formattedRole && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {formattedRole}
            </span>
          )}
        </div>
      </div>

      {/* Right: Live Connection, Custom Actions, Notification Bell, User Snippet */}
      <div className="flex items-center gap-3">
        {/* Realtime Socket Status Indicator (desktop) */}
        {/* <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 text-[10px] font-bold text-slate-500 dark:text-gray-400">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>{isConnected ? "Live Sync Active" : "Connecting..."}</span>
        </div> */}

        {/* Any role-specific action injected into header */}
        {children}

        {/* Notification Bell Button with Realtime Badge */}
        <button
          type="button"
          onClick={toggleDrawer}
          className="relative p-2.5 rounded-xl text-slate-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-gray-900 border border-slate-200/80 dark:border-gray-800 transition shadow-2xs cursor-pointer focus:outline-none"
          title="Notifications & Alerts"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center px-1 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-md animate-bounce">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Snippet */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-black text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
              {displayName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
              {formattedRole || portalName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default EcosystemHeader;
