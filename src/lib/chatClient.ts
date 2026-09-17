import { getApiClient } from "@/lib/apiClient";
import { getWsBackendUrl } from "@/lib/apiConfig";
import { ChatMessage, ChatThread } from "@/types";

/** Get-or-create the chat thread for a lost/found pair. 403s if AI confidence hasn't hit the gate yet. */
export async function getOrCreateThread(
  complaintId: string,
  foundItemId: string,
  requesterEmail: string
): Promise<ChatThread> {
  const api = getApiClient();
  const res = await api.post("/chat/thread", { complaintId, foundItemId, requesterEmail });
  return res.data as ChatThread;
}

export async function fetchMessages(threadId: string, email: string): Promise<ChatMessage[]> {
  const api = getApiClient();
  const res = await api.get(`/chat/${threadId}/messages`, { params: { email } });
  return res.data as ChatMessage[];
}

/** Founder-only. Locks the chat and hands off to the existing challenge-question claim flow. */
export async function startVerification(threadId: string, founderEmail: string): Promise<ChatThread> {
  const api = getApiClient();
  const res = await api.post(`/chat/${threadId}/start-verification`, null, {
    params: { founder_email: founderEmail },
  });
  return res.data as ChatThread;
}

/** Either party confirms physical handover is complete, closing the chat permanently. */
export async function completeHandover(threadId: string, email: string): Promise<ChatThread> {
  const api = getApiClient();
  const res = await api.post(`/chat/${threadId}/complete-handover`, null, {
    params: { email },
  });
  return res.data as ChatThread;
}

export async function fetchMyThreads(email: string): Promise<ChatThread[]> {
  const api = getApiClient();
  const res = await api.get("/chat/my-threads", { params: { email } });
  return res.data as ChatThread[];
}

export const PRE_VERIFICATION_QUESTIONS_LOSTER = [
  "Where exactly did you find it?",
  "What time did you find it?",
  "Can you describe the item's condition?",
  "Can you share a safe public meeting point?",
  "Are you ready to initiate the verification challenge?",
] as const;

export const PRE_VERIFICATION_ANSWERS_LOSTER = [
  "I lost it on campus earlier today.",
  "I lost it near the library / canteen area.",
  "It has my personal marks and contents inside.",
  "I can verify the secret challenge questions.",
  "Yes, I am available to meet and verify.",
] as const;

export const PRE_VERIFICATION_QUESTIONS_FINDER = [
  "Can you describe key details or unique marks on the item?",
  "When and where approximately did you lose it?",
  "What brand, color, or model is the item?",
  "Are you ready to answer the verification challenge?",
  "Can you share a safe public meeting point?",
] as const;

export const PRE_VERIFICATION_ANSWERS_FINDER = [
  "I found it near the campus grounds / academic block.",
  "I found it earlier today and kept it safe.",
  "The item is in good condition and kept securely.",
  "Let's coordinate at a campus security desk or public spot.",
  "Please answer the verification challenge so we can proceed.",
] as const;

export const PRE_VERIFICATION_MESSAGES = [
  ...PRE_VERIFICATION_QUESTIONS_LOSTER,
  ...PRE_VERIFICATION_ANSWERS_LOSTER,
  ...PRE_VERIFICATION_QUESTIONS_FINDER,
  ...PRE_VERIFICATION_ANSWERS_FINDER,
  "Can you describe the item?",
] as const;

export type PreVerificationMessage = typeof PRE_VERIFICATION_MESSAGES[number];

type ChatSocketEvent =
  | { type: "message"; id: string; threadId: string; senderEmail: string; text: string; sentAt: string }
  | { type: "verification_started"; startedAt: string }
  | { type: "verification_completed"; verified: boolean }
  | { type: "handover_completed"; completedBy: string; handedOverAt: string }
  | { type: "moderation_notice"; tier: "nudge" | "held"; message: string; heldMessageCount?: number }
  | { type: "conversation_frozen"; message: string }
  | { type: "presence"; onlineEmails: string[]; userEmail: string; status: "online" | "offline" }
  | { type: "error"; message: string; allowedMessages?: string[] }
  | { event: "phase_changed"; status: string };

/**
 * Thin WebSocket wrapper for one chat thread.
 */
export function connectChatSocket(
  threadId: string,
  email: string,
  handlers: {
    onMessage: (msg: { type: "message"; id: string; threadId: string; senderEmail: string; text: string; sentAt: string }) => void;
    onVerificationStarted: () => void;
    onVerificationCompleted?: () => void;
    onHandoverCompleted?: (completedBy: string) => void;
    onModerationNotice?: (tier: "nudge" | "held", message: string, heldMessageCount?: number) => void;
    onConversationFrozen?: (message: string) => void;
    onPresenceChange?: (onlineEmails: string[], userEmail: string, status: "online" | "offline") => void;
    onPhaseChanged?: (status: string) => void;
    onError?: (message: string, allowedMessages?: string[]) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }
): WebSocket {
  const base = getWsBackendUrl();
  const ws = new WebSocket(`${base}/chat/ws/${threadId}?email=${encodeURIComponent(email)}`);

  ws.onopen = () => handlers.onOpen?.();
  ws.onclose = () => handlers.onClose?.();
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.event === "phase_changed") {
        handlers.onPhaseChanged?.(data.status);
      } else if (data.type === "message") {
        handlers.onMessage(data);
      } else if (data.type === "verification_started") {
        handlers.onVerificationStarted();
      } else if (data.type === "verification_completed") {
        handlers.onVerificationCompleted?.();
      } else if (data.type === "handover_completed") {
        handlers.onHandoverCompleted?.(data.completedBy);
      } else if (data.type === "moderation_notice") {
        handlers.onModerationNotice?.(data.tier, data.message, data.heldMessageCount);
      } else if (data.type === "conversation_frozen") {
        handlers.onConversationFrozen?.(data.message);
      } else if (data.type === "presence") {
        handlers.onPresenceChange?.(data.onlineEmails, data.userEmail, data.status);
      } else if (data.type === "error") {
        handlers.onError?.(data.message, data.allowedMessages);
      } else if (data.type === "ping") {
        // Liveness heartbeat from the backend — any received frame counts
        // as "alive" server-side, so just echo something back immediately.
        // Without this, an idle-but-open tab gets swept to "offline" after
        // the server's presence timeout even though the user never left.
        ws.send(JSON.stringify({ type: "pong" }));
      }
    } catch {
      // ignore malformed frame
    }
  };

  return ws;
}

export function sendChatMessage(ws: WebSocket, text: string): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ text }));
  }
}