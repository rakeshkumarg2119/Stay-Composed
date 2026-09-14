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

type ChatSocketEvent =
  | { type: "message"; id: string; threadId: string; senderEmail: string; text: string; sentAt: string }
  | { type: "verification_started"; startedAt: string }
  | { type: "verification_completed"; verified: boolean }
  | { type: "handover_completed"; completedBy: string; handedOverAt: string }
  | { type: "error"; message: string };

/**
 * Thin WebSocket wrapper for one chat thread.
 */
export function connectChatSocket(
  threadId: string,
  email: string,
  handlers: {
    onMessage: (msg: ChatSocketEvent & { type: "message" }) => void;
    onVerificationStarted: () => void;
    onVerificationCompleted?: () => void;
    onHandoverCompleted?: (completedBy: string) => void;
    onError?: (message: string) => void;
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
      const data: ChatSocketEvent = JSON.parse(event.data);
      if (data.type === "message") handlers.onMessage(data);
      else if (data.type === "verification_started") handlers.onVerificationStarted();
      else if (data.type === "verification_completed") handlers.onVerificationCompleted?.();
      else if (data.type === "handover_completed") handlers.onHandoverCompleted?.(data.completedBy);
      else if (data.type === "error") handlers.onError?.(data.message);
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
