"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { getApiClient } from "@/lib/apiClient";
import { getWsBackendUrl } from "@/lib/apiConfig";
import { fetchMyThreads } from "@/lib/chatClient";
import { AppNotification, ChatThread, TrueOwnerItem } from "@/types";

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  activeToast: AppNotification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  requestPermission: () => Promise<NotificationPermission>;
  permissionState: NotificationPermission | "unsupported";
  triggerMatchCheck: () => Promise<void>;
  activeChatModal: {
    complaintId: string;
    foundItemId: string;
    isFounder: boolean;
    itemTitle: string;
  } | null;
  openChatModal: (data: {
    complaintId: string;
    foundItemId: string;
    isFounder: boolean;
    itemTitle: string;
  }) => void;
  closeChatModal: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Gentle dual-tone chime using Web Audio API (no external asset dependency)
function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch {
    // Audio autostart policy or unsupported audio context
  }
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [activeChatModal, setActiveChatModal] = useState<{
    complaintId: string;
    foundItemId: string;
    isFounder: boolean;
    itemTitle: string;
  } | null>(null);

  // Keep track of known matches to avoid repeated notifications: Set of `${forComplaintId}:${foundItemId}`
  const knownMatchesRef = useRef<Set<string>>(new Set());
  // Active background sockets map threadId -> WebSocket
  const socketsRef = useRef<Map<string, WebSocket>>(new Map());
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize permission state
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setPermissionState(Notification.permission);
      } else {
        setPermissionState("unsupported");
      }
    }
  }, []);

  // Load saved notifications and known matches on mount or user change
  useEffect(() => {
    if (!userEmail) {
      setNotifications([]);
      return;
    }

    try {
      const stored = localStorage.getItem(`stay_composed_notifs_${userEmail}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
      const storedMatches = localStorage.getItem(
        `stay_composed_known_matches_${userEmail}`
      );
      if (storedMatches) {
        const parsed = JSON.parse(storedMatches);
        if (Array.isArray(parsed)) {
          knownMatchesRef.current = new Set(parsed);
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, [userEmail]);

  // Save notifications to localStorage on update
  useEffect(() => {
    if (!userEmail) return;
    try {
      localStorage.setItem(
        `stay_composed_notifs_${userEmail}`,
        JSON.stringify(notifications.slice(0, 50))
      );
    } catch {
      // storage quota or error
    }
  }, [notifications, userEmail]);

  const pushNotification = useCallback(
    (notif: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const full: AppNotification = {
        ...notif,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [full, ...prev]);
      setActiveToast(full);
      playNotificationChime();

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 7000);

      // Trigger Browser System Notification if allowed
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(full.title, {
            body: full.body,
            icon: "/stay_composed.png",
          });
        } catch {
          // ignore notification error
        }
      }
    },
    []
  );

  // Check for candidate matches for user's complaints
  const triggerMatchCheck = useCallback(async () => {
    if (!userEmail) return;
    try {
      const api = getApiClient();
      const res = await api.get("/items/mine", {
        params: { email: userEmail },
      });
      const candidateMatches: {
        candidate: TrueOwnerItem;
        forComplaintId: string;
        confidence: number;
      }[] = res.data?.candidateMatches || [];
      const threshold = res.data?.chatConfidenceThreshold || 50;

      const currentKnown = new Set(knownMatchesRef.current);
      let newlyFound = 0;

      candidateMatches.forEach((m) => {
        const candidateId = m.candidate._id || m.candidate.id || "";
        const pairKey = `${m.forComplaintId}:${candidateId}`;

        if (!currentKnown.has(pairKey)) {
          currentKnown.add(pairKey);
          // Only notify if confidence meets threshold
          if (m.confidence >= threshold) {
            newlyFound++;
            pushNotification({
              type: "match_found",
              title: "🔎 Match Discovered!",
              body: `A found item matches your lost report (${m.confidence}% AI confidence). An alert email has also been sent to your inbox. Tap to view and chat!`,
              data: {
                complaintId: m.forComplaintId,
                foundItemId: candidateId,
                confidence: m.confidence,
                otherItemTitle: m.candidate.title,
              },
            });
          }
        }
      });

      knownMatchesRef.current = currentKnown;
      try {
        localStorage.setItem(
          `stay_composed_known_matches_${userEmail}`,
          JSON.stringify(Array.from(currentKnown))
        );
      } catch {
        // ignore
      }
    } catch {
      // network/backend unavailable
    }
  }, [userEmail, pushNotification]);

  // Periodic polling for matches (every 18 seconds)
  useEffect(() => {
    if (!userEmail) return;
    triggerMatchCheck();

    const interval = setInterval(triggerMatchCheck, 18000);
    const onFocus = () => triggerMatchCheck();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [userEmail, triggerMatchCheck]);

  // Background WebSockets for user's active chat threads to detect incoming messages in real time
  useEffect(() => {
    if (!userEmail) return;

    let cancelled = false;

    async function syncThreads() {
      try {
        const threads: ChatThread[] = await fetchMyThreads(userEmail!);
        if (cancelled) return;

        const baseWs = getWsBackendUrl();
        if (!baseWs) return;

        const activeThreads = threads.filter(
          (t) =>
            t.status === "chat" ||
            t.status === "verifying" ||
            t.status === "verification_pending" ||
            t.status === "verified"
        );

        activeThreads.forEach((t) => {
          if (socketsRef.current.has(t.threadId)) return;

          try {
            const ws = new WebSocket(
              `${baseWs}/chat/ws/${t.threadId}?email=${encodeURIComponent(
                userEmail!
              )}`
            );

            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === "message" && data.senderEmail !== userEmail) {
                  // If chat modal is currently open for this exact thread, skip toast
                  const isCurrentOpen =
                    activeChatModal &&
                    activeChatModal.complaintId === t.complaintId &&
                    activeChatModal.foundItemId === t.foundItemId;

                  const isFounder = userEmail === t.founderEmail;
                  const senderRole = isFounder ? "Loster (Claimant)" : "Finder";
                  const senderDisplayName = isFounder
                    ? t.claimantName || "Item Owner"
                    : t.founderName || "Item Finder";

                  pushNotification({
                    type: "chat_message",
                    title: `💬 ${senderDisplayName} (${senderRole})`,
                    body: data.text,
                    data: {
                      threadId: t.threadId,
                      complaintId: t.complaintId,
                      foundItemId: t.foundItemId,
                      confidence: t.confidence,
                      senderEmail: data.senderEmail,
                      senderName: senderDisplayName,
                    },
                  });
                } else if (data.event === "phase_changed") {
                  if (data.status === "verification_pending" || data.status === "verifying") {
                    pushNotification({
                      type: "verification",
                      title: "🔒 Verification Initiated",
                      body:
                        userEmail === t.founderEmail
                          ? "Verification challenge started. Waiting for the claimant's answers."
                          : "The finder has initiated the verification challenge! Answer the questions to confirm ownership.",
                      data: {
                        threadId: t.threadId,
                        complaintId: t.complaintId,
                        foundItemId: t.foundItemId,
                      },
                    });
                  } else if (data.status === "verified") {
                    pushNotification({
                      type: "verification",
                      title: "✅ Ownership Verified!",
                      body:
                        "Ownership challenge successfully verified! Free-text chat is now open to coordinate meeting.",
                      data: {
                        threadId: t.threadId,
                        complaintId: t.complaintId,
                        foundItemId: t.foundItemId,
                      },
                    });
                  } else if (data.status === "handed_over") {
                    pushNotification({
                      type: "handover",
                      title: "🤝 Handover Completed",
                      body:
                        "The item handover has been confirmed. The conversation is now successfully resolved.",
                      data: {
                        threadId: t.threadId,
                        complaintId: t.complaintId,
                        foundItemId: t.foundItemId,
                      },
                    });
                  }
                }
              } catch {
                // malformed frame
              }
            };

            ws.onclose = () => {
              socketsRef.current.delete(t.threadId);
            };

            socketsRef.current.set(t.threadId, ws);
          } catch {
            // socket error
          }
        });
      } catch {
        // ignore
      }
    }

    syncThreads();
    const threadSyncInterval = setInterval(syncThreads, 20000);

    return () => {
      cancelled = true;
      clearInterval(threadSyncInterval);
      socketsRef.current.forEach((ws) => ws.close());
      socketsRef.current.clear();
    };
  }, [userEmail, pushNotification, activeChatModal]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (userEmail) {
      try {
        localStorage.removeItem(`stay_composed_notifs_${userEmail}`);
      } catch {
        // ignore
      }
    }
  }, [userEmail]);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported" as NotificationPermission;
    }
    try {
      const res = await Notification.requestPermission();
      setPermissionState(res);
      return res;
    } catch {
      return "denied" as NotificationPermission;
    }
  }, []);

  const openChatModal = useCallback(
    (data: {
      complaintId: string;
      foundItemId: string;
      isFounder: boolean;
      itemTitle: string;
    }) => {
      setActiveChatModal(data);
    },
    []
  );

  const closeChatModal = useCallback(() => {
    setActiveChatModal(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearAll,
        requestPermission,
        permissionState,
        triggerMatchCheck,
        activeChatModal,
        openChatModal,
        closeChatModal,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
