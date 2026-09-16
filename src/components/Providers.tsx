"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationToast from "@/components/NotificationToast";
import GlobalChatModal from "@/components/GlobalChatModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <NotificationToast />
        <GlobalChatModal />
      </NotificationProvider>
    </SessionProvider>
  );
}