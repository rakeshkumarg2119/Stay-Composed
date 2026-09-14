"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getBackendUrl, setBackendUrl } from "@/lib/apiConfig";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "connected" | "failed">("idle");

  useEffect(() => {
    setUrl(getBackendUrl());
  }, []);

  async function handleConnect() {
    if (!url.trim()) return;
    setStatus("checking");
    try {
      const res = await fetch(`${url.trim().replace(/\/$/, "")}/health`);
      if (res.ok) {
        setBackendUrl(url);
        setStatus("connected");
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6">
        <div className="bg-white border border-paperDark rounded-xl p-5 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-purple">Account</p>
          <p className="text-sm text-ink/70">
            {session?.user?.email ?? "Not signed in"}
          </p>
        </div>

        <div className="tag-card tag-card--lost p-5">
          <p className="text-xs uppercase tracking-wide text-purple mb-1">
            What's a tunnel?
          </p>
          <p className="text-sm text-ink/60">
            Your FastAPI backend runs locally during the hackathon. ngrok
            gives it a public URL so this deployed frontend can reach it —
            paste that URL here each time you restart the tunnel.
          </p>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex flex-col gap-6 max-w-md">
        <h1 className="font-display text-2xl">Settings</h1>

        <div className="bg-white border border-paperDark rounded-xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-ink/70 block mb-2">
              Backend URL (ngrok)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxx-xx-xx.ngrok-free.app"
              className="w-full border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={status === "checking"}
            className="bg-purple text-white px-4 py-2 rounded-full text-sm hover:bg-blue transition-colors disabled:opacity-50 self-start"
          >
            {status === "checking" ? "Connecting..." : "Connect"}
          </button>

          {status === "connected" && (
            <p className="text-sm text-sky">Connected successfully.</p>
          )}
          {status === "failed" && (
            <p className="text-sm text-brick">
              Couldn't reach that URL. Check the tunnel is running and try
              again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}