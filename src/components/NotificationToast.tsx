"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";

export default function NotificationToast() {
  const router = useRouter();
  const { activeToast, dismissToast, openChatModal, markAsRead } =
    useNotifications();

  if (!activeToast) return null;

  function handleAction() {
    if (!activeToast) return;
    markAsRead(activeToast.id);

    if (activeToast.type === "chat_message" && activeToast.data) {
      const { complaintId, foundItemId, senderName, isFounder } = activeToast.data;
      if (complaintId && foundItemId) {
        openChatModal({
          complaintId,
          foundItemId,
          isFounder: !!isFounder, // role of the person opening this, from the thread data — not a default
          itemTitle: senderName || "Chat Conversation",
        });
      } else {
        router.push("/true-owner");
      }
    } else if (activeToast.type === "match_found") {
      router.push("/true-owner");
    } else {
      router.push("/true-owner");
    }

    dismissToast();
  }

  return (
    <div className="fixed bottom-5 right-5 z-60 max-w-sm sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md border-2 border-purple/20 shadow-2xl rounded-2xl p-4 sm:p-4.5 flex flex-col gap-3 ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center shrink-0 border border-purple/15 text-purple shadow-2xs mt-0.5">
              {activeToast.type === "match_found" ? (
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              ) : activeToast.type === "chat_message" ? (
                <MessageSquare className="w-5 h-5 text-purple" />
              ) : activeToast.type === "verification" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <Bell className="w-5 h-5 text-sky" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-ink leading-tight">
                  {activeToast.title}
                </h4>
                {activeToast.data?.confidence && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                    {activeToast.data.confidence}% Match
                  </span>
                )}
              </div>
              <p className="text-xs text-ink/70 leading-relaxed mt-1 line-clamp-3">
                {activeToast.body}
              </p>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-ink/40 hover:text-ink/80 p-1 rounded-lg hover:bg-paper transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-paperDark/60 text-[11px]">
          <span className="text-ink/40 font-medium">Just now</span>
          <div className="flex items-center gap-2">
            <button
              onClick={dismissToast}
              className="text-ink/60 hover:text-ink px-2 py-1 rounded-md transition-colors font-medium"
            >
              Dismiss
            </button>
            <button
              onClick={handleAction}
              className="bg-purple text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue transition-colors flex items-center gap-1 shadow-2xs"
            >
              {activeToast.type === "chat_message" ? "Open Chat" : "View Details"}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}