"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Inbox,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { AppNotification } from "@/types";

export default function NotificationDropdown() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPermission,
    permissionState,
    openChatModal,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function handleItemClick(notif: AppNotification) {
    markAsRead(notif.id);
    setIsOpen(false);

    if (notif.type === "chat_message" && notif.data) {
      const { complaintId, foundItemId, senderName } = notif.data;
      if (complaintId && foundItemId) {
        openChatModal({
          complaintId,
          foundItemId,
          isFounder: false,
          itemTitle: senderName || "Chat Conversation",
        });
        return;
      }
    }
    router.push("/true-owner");
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-full text-ink/70 hover:text-purple hover:bg-paperDark/50 transition-colors focus:outline-none"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-brick text-white text-[10px] font-bold rounded-full animate-bounce shadow-2xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm sm:max-w-none bg-white border border-paperDark rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-paperDark bg-paper/60">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-ink">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-purple/10 text-purple font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-purple hover:underline font-semibold text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-ink/40 hover:text-brick p-1 rounded transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Optional Permission Prompt */}
          {permissionState === "default" && (
            <div className="bg-purple/5 border-b border-purple/15 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="text-ink/75 text-[11px] leading-tight">
                Enable desktop alerts for instant match popups
              </span>
              <button
                onClick={requestPermission}
                className="bg-purple text-white px-2.5 py-1 rounded-md text-[11px] font-semibold hover:bg-blue transition-colors shrink-0 shadow-2xs"
              >
                Enable
              </button>
            </div>
          )}

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-paperDark/60">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center text-ink/40 gap-2">
                <Inbox className="w-8 h-8 stroke-1 text-ink/30" />
                <p className="text-xs font-medium">No notifications yet</p>
                <p className="text-[11px] text-ink/50 max-w-[220px]">
                  When a match is found or an owner/finder sends a message, you&apos;ll be alerted here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-3 text-left ${
                    notif.read
                      ? "bg-white hover:bg-paper/50"
                      : "bg-purple/5 hover:bg-purple/10"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-paperDark flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {notif.type === "match_found" ? (
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    ) : notif.type === "chat_message" ? (
                      <MessageSquare className="w-4 h-4 text-purple" />
                    ) : notif.type === "verification" ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Bell className="w-4 h-4 text-sky" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-ink truncate">
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-ink/40 shrink-0">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-ink/70 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.body}
                    </p>

                    {notif.type === "match_found" && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple bg-purple/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          View Match
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-ink/50">
                          <Mail className="w-3 h-3" />
                          Email Dispatched
                        </span>
                      </div>
                    )}

                    {notif.type === "chat_message" && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky bg-sky/10 px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-3 h-3" />
                          Reply in Chat
                        </span>
                      </div>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-purple shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-paperDark bg-paper/40 text-[10px] text-ink/50 flex items-center justify-between">
            <span>Stay Composed AI Engine</span>
            <span>Live Alerts Active</span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  } catch {
    return "";
  }
}
