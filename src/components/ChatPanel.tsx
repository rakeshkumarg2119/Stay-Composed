"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Lock, Send, ShieldCheck, X } from "lucide-react";
import {
  completeHandover,
  connectChatSocket,
  fetchMessages,
  getOrCreateThread,
  sendChatMessage,
  startVerification,
} from "@/lib/chatClient";
import { ChatMessage, ChatThread } from "@/types";

const QUICK_TEMPLATES = [
  "📍 Let's meet at Central Library entrance",
  "🏛️ Let's meet at RTA Auditorium reception",
  "☕ Can we meet at the campus canteen?",
  "🕒 What time are you free to meet today?",
  "🚶 I have reached the meeting spot now",
  "🤝 Item received safely, thank you so much!",
];

export default function ChatPanel({
  complaintId,
  foundItemId,
  currentEmail,
  isFounder,
  itemTitle,
  onClose,
  onVerificationUnlocked,
}: {
  complaintId: string;
  foundItemId: string;
  currentEmail: string;
  isFounder: boolean;
  itemTitle: string;
  onClose: () => void;
  onVerificationUnlocked: () => void; // claimant side: open the existing ClaimModal
}) {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [gateError, setGateError] = useState("");
  const [connError, setConnError] = useState("");
  const [starting, setStarting] = useState(false);
  const [completingHandover, setCompletingHandover] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const t = await getOrCreateThread(complaintId, foundItemId, currentEmail);
        if (cancelled) return;
        setThread(t);

        const history = await fetchMessages(t.threadId, currentEmail);
        if (cancelled) return;
        setMessages(history);

        const ws = connectChatSocket(t.threadId, currentEmail, {
          onMessage: (msg) => setMessages((prev) => [...prev, msg]),
          onVerificationStarted: () => {
            setThread((prev) => (prev ? { ...prev, status: "verifying" } : prev));
            if (!isFounder) onVerificationUnlocked();
          },
          onVerificationCompleted: () => {
            setThread((prev) => (prev ? { ...prev, status: "verified" } : prev));
          },
          onHandoverCompleted: () => {
            setThread((prev) => (prev ? { ...prev, status: "handed_over" } : prev));
          },
          onError: (message) => setConnError(message),
        });
        wsRef.current = ws;
      } catch (err: any) {
        setGateError(
          err?.response?.data?.detail ||
            "Couldn't open chat — this pair hasn't reached the AI match threshold yet."
        );
      }
    }

    setup();
    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaintId, foundItemId, currentEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const locked = thread?.status === "handed_over" || thread?.status === "closed" || thread?.status === "resolved";

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!draft.trim() || !wsRef.current || locked) return;
    sendChatMessage(wsRef.current, draft.trim());
    setDraft("");
  }

  function handleQuickSend(template: string) {
    if (!wsRef.current || locked) return;
    sendChatMessage(wsRef.current, template);
  }

  async function handleStartVerification() {
    if (!thread) return;
    setStarting(true);
    setConnError("");
    try {
      const updated = await startVerification(thread.threadId, currentEmail);
      setThread(updated);
    } catch (err: any) {
      setConnError(err?.response?.data?.detail || "Couldn't start verification.");
    } finally {
      setStarting(false);
    }
  }

  async function handleCompleteHandover() {
    if (!thread) return;
    if (!confirm("Confirm that the item has been physically handed over? This will close the chat permanently.")) {
      return;
    }
    setCompletingHandover(true);
    setConnError("");
    try {
      const updated = await completeHandover(thread.threadId, currentEmail);
      setThread(updated);
    } catch (err: any) {
      setConnError(err?.response?.data?.detail || "Couldn't complete handover.");
    } finally {
      setCompletingHandover(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-paperDark rounded-2xl sm:rounded-3xl w-full max-w-lg h-[85vh] sm:h-[650px] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-paperDark bg-paper/60">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-sky bg-sky/10 px-2 py-0.5 rounded-md">
              {thread ? `${thread.confidence}% AI Match Chat` : "Opening chat..."}
            </span>
            <h2 className="font-display text-sm text-ink mt-1 line-clamp-1">{itemTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 shrink-0 rounded-full bg-white flex items-center justify-center text-ink/60 hover:text-ink border border-paperDark"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {gateError ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="flex flex-col items-center gap-2 text-brick">
              <AlertCircle className="w-6 h-6" />
              <p className="text-xs leading-relaxed">{gateError}</p>
            </div>
          </div>
        ) : !thread ? (
          <div className="flex-1 flex items-center justify-center text-xs text-ink/50">Loading chat...</div>
        ) : (
          <>
            {/* Status banners */}
            {thread.status === "verifying" && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-2 text-amber-800 text-xs">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  {isFounder
                    ? "Verification active — waiting for claimant to answer challenge."
                    : "Founder initiated challenge verification. Chat remains open to coordinate!"}
                </span>
                {!isFounder && (
                  <button
                    onClick={onVerificationUnlocked}
                    className="bg-amber-600 text-white px-2.5 py-1 rounded-full text-[11px] font-semibold hover:bg-amber-700 shrink-0"
                  >
                    Answer Challenge
                  </button>
                )}
              </div>
            )}

            {thread.status === "verified" && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between gap-2 text-emerald-800 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Ownership Verified! Coordinate meeting below.
                </span>
                <button
                  onClick={handleCompleteHandover}
                  disabled={completingHandover}
                  className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[11px] font-semibold hover:bg-emerald-700 transition-colors shrink-0 disabled:opacity-50 shadow-xs"
                >
                  {completingHandover ? "Closing..." : "Confirm Handover & Close"}
                </button>
              </div>
            )}

            {locked && (
              <div className="bg-paperDark/60 border-b border-paperDark px-4 py-2.5 flex items-center gap-2 text-ink/80 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🤝 Handover complete! This item was safely returned and the chat is closed.</span>
              </div>
            )}

            {/* Founder-only start verification button */}
            {isFounder && thread.status === "chat" && (
              <div className="px-4 py-2.5 border-b border-paperDark bg-purple/5 flex items-center justify-between gap-3">
                <p className="text-[11px] text-ink/60 leading-snug">
                  Confident this is the owner? Start verification to test their secret challenge.
                </p>
                <button
                  onClick={handleStartVerification}
                  disabled={starting}
                  className="shrink-0 bg-purple text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {starting ? "Starting..." : "Start Verification"}
                </button>
              </div>
            )}

            {connError && (
              <div className="px-4 py-2 text-xs text-brick bg-brick/5 border-b border-brick/20">{connError}</div>
            )}

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
              {messages.length === 0 ? (
                <p className="text-xs text-ink/40 text-center mt-6">
                  No messages yet — say hello or pick a quick template below to coordinate.
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderEmail === currentEmail;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          mine ? "bg-purple text-white rounded-br-sm" : "bg-paper text-ink rounded-bl-sm border border-paperDark/60"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Template Chips */}
            {!locked && (
              <div className="px-3 pt-2 pb-1 border-t border-paperDark/50 bg-paper/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-ink/40 tracking-wider shrink-0 mr-1">
                  Quick:
                </span>
                {QUICK_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickSend(tmpl)}
                    className="shrink-0 bg-white border border-paperDark hover:border-purple text-ink/75 hover:text-purple text-[11px] px-2.5 py-1 rounded-full transition-all shadow-2xs"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-paperDark bg-white">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={locked}
                placeholder={locked ? "Handover complete — chat is closed" : "Type a message or click a quick template..."}
                className="flex-1 border border-paperDark rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lavender disabled:opacity-50 disabled:bg-paper"
              />
              <button
                type="submit"
                disabled={locked || !draft.trim()}
                className="w-9 h-9 shrink-0 rounded-full bg-purple text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
