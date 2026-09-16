"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Lock,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  completeHandover,
  connectChatSocket,
  fetchMessages,
  getOrCreateThread,
  PRE_VERIFICATION_ANSWERS_FINDER,
  PRE_VERIFICATION_ANSWERS_LOSTER,
  PRE_VERIFICATION_MESSAGES,
  PRE_VERIFICATION_QUESTIONS_FINDER,
  PRE_VERIFICATION_QUESTIONS_LOSTER,
  sendChatMessage,
  startVerification,
} from "@/lib/chatClient";
import { ChatMessage, ChatThread } from "@/types";

// Free-form logistics chips — only usable once status === "verified",
// where the backend allows any text.
const POST_VERIFICATION_TEMPLATES = [
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
  const [nudgeNotice, setNudgeNotice] = useState("");
  const [frozenNotice, setFrozenNotice] = useState("");
  const [starting, setStarting] = useState(false);
  const [completingHandover, setCompletingHandover] = useState(false);
  const [templateTab, setTemplateTab] = useState<"questions" | "answers">("questions");
  const [allowedMessagesList, setAllowedMessagesList] = useState<string[]>([
    ...PRE_VERIFICATION_MESSAGES,
  ]);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const t = await getOrCreateThread(complaintId, foundItemId, currentEmail);
        if (cancelled) return;
        setThread(t);

        const otherTargetEmail = isFounder ? t.claimantEmail : t.founderEmail;

        const history = await fetchMessages(t.threadId, currentEmail);
        if (cancelled) return;
        setMessages(history);

        const ws = connectChatSocket(t.threadId, currentEmail, {
          onMessage: (msg) => setMessages((prev) => [...prev, msg]),
          onPresenceChange: (onlineEmails) => {
            if (otherTargetEmail) {
              setIsOtherOnline(
                onlineEmails.some(
                  (e) => e.toLowerCase() === otherTargetEmail.toLowerCase()
                )
              );
            }
          },
          onPhaseChanged: (status) => {
            if (status === "verification_pending" || status === "verifying") {
              setThread((prev) => (prev ? { ...prev, status: "verifying" } : prev));
              if (!isFounder) onVerificationUnlocked();
            } else if (status === "verified") {
              setThread((prev) => (prev ? { ...prev, status: "verified" } : prev));
            } else if (status === "handed_over") {
              setThread((prev) => (prev ? { ...prev, status: "handed_over" } : prev));
            } else if (status === "frozen") {
              setThread((prev) => (prev ? { ...prev, status: "frozen" } : prev));
            }
          },
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
          onModerationNotice: (tier, message, heldMessageCount) => {
            if (tier === "nudge") {
              setNudgeNotice(message);
            } else {
              setConnError(
                heldMessageCount ? `${message} (${heldMessageCount}/3 warnings)` : message
              );
            }
          },
          onConversationFrozen: (message) => {
            setThread((prev) => (prev ? { ...prev, status: "frozen" } : prev));
            setFrozenNotice(message);
          },
          onError: (message, allowed) => {
            if (allowed && allowed.length > 0) {
              setAllowedMessagesList(allowed);
            }
            setConnError(
              allowed ? `${message} Allowed: ${allowed.join(" / ")}` : message
            );
          },
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

  useEffect(() => {
    if (!nudgeNotice) return;
    const t = setTimeout(() => setNudgeNotice(""), 4000);
    return () => clearTimeout(t);
  }, [nudgeNotice]);

  const isVerifying =
    thread?.status === "verifying" || thread?.status === "verification_pending";
  const isHandedOver =
    thread?.status === "handed_over" ||
    thread?.status === "closed" ||
    thread?.status === "resolved";
  const isFrozen = thread?.status === "frozen";
  const locked = isHandedOver || isFrozen || isVerifying;
  const preVerification = thread?.status === "chat";
  const isVerified = thread?.status === "verified";

  const preVerificationQuestions = isFounder
    ? PRE_VERIFICATION_QUESTIONS_FINDER
    : PRE_VERIFICATION_QUESTIONS_LOSTER;
  const preVerificationAnswers = isFounder
    ? PRE_VERIFICATION_ANSWERS_FINDER
    : PRE_VERIFICATION_ANSWERS_LOSTER;

  const activeTemplates = preVerification
    ? templateTab === "questions"
      ? preVerificationQuestions
      : preVerificationAnswers
    : isVerified
    ? POST_VERIFICATION_TEMPLATES
    : [];

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
    if (
      !confirm(
        "Confirm that the item has been physically handed over? This will close the chat permanently."
      )
    ) {
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
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center text-purple font-display font-semibold text-xs shadow-2xs">
                {(isFounder ? thread?.claimantName || "O" : thread?.founderName || "F")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  isOtherOnline ? "bg-emerald-500" : "bg-gray-300"
                }`}
                title={isOtherOnline ? "Online now" : "Offline"}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold text-ink line-clamp-1">
                  {isFounder
                    ? thread?.claimantName || "Item Owner"
                    : thread?.founderName || "Item Finder"}
                </h2>
                <span className="text-[10px] text-ink/60 uppercase tracking-wider font-semibold bg-white border border-paperDark px-1.5 py-0.2 rounded-md">
                  {isFounder ? "Owner" : "Finder"}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium">
                  {isOtherOnline ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                      Online
                    </span>
                  ) : (
                    <span className="text-ink/40">Offline</span>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-ink/60 line-clamp-1 mt-0.5">
                {thread ? `${thread.confidence}% AI Match • ${itemTitle}` : itemTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 shrink-0 rounded-full bg-white flex items-center justify-center text-ink/60 hover:text-ink border border-paperDark shadow-2xs"
            title="Close chat"
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
          <div className="flex-1 flex items-center justify-center text-xs text-ink/50">
            Loading chat...
          </div>
        ) : (
          <>
            {/* Status banners */}
            {isVerifying && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-2 text-amber-800 text-xs">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  {isFounder
                    ? "Verification challenge in progress — waiting for claimant to answer."
                    : "Finder initiated verification. Chat is locked until you answer the challenge!"}
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

            {isVerified && (
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

            {isFrozen && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 flex items-center gap-2 text-red-800 text-xs">
                <Ban className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {frozenNotice ||
                    "This conversation was frozen due to concerning language and is under admin review."}
                </span>
              </div>
            )}

            {isHandedOver && (
              <div className="bg-paperDark/60 border-b border-paperDark px-4 py-2.5 flex items-center gap-2 text-ink/80 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🤝 Handover complete! This item was safely returned and the chat is closed.</span>
              </div>
            )}

            {/* Founder-only start verification button */}
            {isFounder && preVerification && (
              <div className="px-4 py-2.5 border-b border-paperDark bg-purple/5 flex items-center justify-between gap-3">
                <p className="text-[11px] text-ink/60 leading-snug">
                  Ready to test ownership? Start verification challenge for the claimant.
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
              <div className="px-4 py-2 text-xs text-brick bg-brick/5 border-b border-brick/20">
                {connError}
              </div>
            )}

            {nudgeNotice && (
              <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                {nudgeNotice}
              </div>
            )}

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
              {messages.length === 0 ? (
                <p className="text-xs text-ink/40 text-center mt-6">
                  {preVerification
                    ? "No messages yet — tap a safe template below or type your own message to coordinate before verification."
                    : "No messages yet."}
                </p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderEmail === currentEmail;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          mine
                            ? "bg-purple text-white rounded-br-sm"
                            : "bg-paper text-ink rounded-bl-sm border border-paperDark/60"
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
              <div className="px-3 pt-2.5 pb-2 border-t border-paperDark/60 bg-paper/40 flex flex-col gap-1.5">
                {preVerification ? (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-ink/40 tracking-wider">
                          {isFounder ? "Finder Mode:" : "Owner Mode:"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTemplateTab("questions")}
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                            templateTab === "questions"
                              ? "bg-purple text-white shadow-2xs"
                              : "bg-white text-ink/60 border border-paperDark hover:text-ink"
                          }`}
                        >
                          Questions ({preVerificationQuestions.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateTab("answers")}
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                            templateTab === "answers"
                              ? "bg-purple text-white shadow-2xs"
                              : "bg-white text-ink/60 border border-paperDark hover:text-ink"
                          }`}
                        >
                          Answers ({preVerificationAnswers.length})
                        </button>
                      </div>
                      <span className="text-[10px] text-ink/45 hidden xs:inline">
                        {templateTab === "questions" ? "Ask safely" : "Reply safely"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 py-0.5 max-h-28 overflow-y-auto">
                      {activeTemplates.map((tmpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickSend(tmpl)}
                          className="bg-white border border-paperDark hover:border-purple text-ink/80 hover:text-purple text-[11px] px-3 py-1.5 rounded-full transition-all shadow-2xs active:scale-95 text-left font-medium"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5 max-h-20 overflow-y-auto">
                    <span className="text-[10px] uppercase font-bold text-ink/40 tracking-wider shrink-0 mr-1">
                      Quick:
                    </span>
                    {activeTemplates.map((tmpl, i) => (
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
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 px-3 py-3 border-t border-paperDark bg-white"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={locked}
                placeholder={
                  isFrozen
                    ? "Conversation frozen — under admin review"
                    : isHandedOver
                    ? "Handover complete — chat is closed"
                    : isVerifying
                    ? "Chat locked while verification challenge is pending"
                    : preVerification
                    ? "Type a message, or tap a safe question/answer template above..."
                    : "Type a message or click a quick template..."
                }
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