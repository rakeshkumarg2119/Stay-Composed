"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import ChatPanel from "@/components/ChatPanel";

export default function GlobalChatModal() {
  const { data: session } = useSession();
  const router = useRouter();
  const { activeChatModal, closeChatModal } = useNotifications();

  if (!activeChatModal || !session?.user?.email) return null;

  return (
    <ChatPanel
      complaintId={activeChatModal.complaintId}
      foundItemId={activeChatModal.foundItemId}
      currentEmail={session.user.email}
      isFounder={activeChatModal.isFounder}
      itemTitle={activeChatModal.itemTitle}
      onClose={closeChatModal}
      onVerificationUnlocked={() => {
        closeChatModal();
        router.push("/true-owner");
      }}
    />
  );
}
