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
      const res = await fetch(`${url.trim().replace(/\/$/, "")}/health`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.status === "ok") {
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
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6 order-2 lg:order-1">
        <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-purple">Account</p>
          <p className="text-sm text-ink/70 font-medium">
            {session?.user?.email ?? "Not signed in"}
          </p>
          {session ? (
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md self-start">
              Campus Authenticated
            </span>
          ) : (
            <span className="text-[11px] text-ink/50 bg-paper px-2 py-0.5 rounded-md self-start">
              Guest Mode
            </span>
          )}
        </div>

        <div className="tag-card tag-card--lost p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-purple mb-1">
            What is the ngrok tunnel?
          </p>
          <p className="text-xs text-ink/65 leading-relaxed">
            Your FastAPI backend runs locally or on campus servers. ngrok
            gives it a public secure URL so this deployed frontend can communicate with it.
            Paste the active tunnel URL here whenever you restart your tunnel.
          </p>
        </div>
      </aside>

      {/* Main panel — Responsive 2-column layout */}
      <div className="flex flex-col gap-6 order-1 lg:order-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Settings &amp; System Connection</h1>
          <p className="text-xs sm:text-sm text-ink/65 mt-1 leading-relaxed">
            Configure backend endpoints, verify live tunnels, and review platform services.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Backend URL Form */}
          <div className="xl:col-span-6 bg-white border border-paperDark rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="font-display text-xl text-ink mb-1">FastAPI Backend Endpoint</h3>
              <p className="text-xs text-ink/60 mb-4">
                Enter your live ngrok URL to route item matching and blood broadcasts.
              </p>
              <label className="text-xs font-semibold text-ink/70 block mb-1.5">
                Backend URL (HTTPS required)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xxxx-xx-xx.ngrok-free.app"
                className="w-full border border-paperDark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConnect}
                disabled={status === "checking"}
                className="bg-purple text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors disabled:opacity-50 shadow-xs"
              >
                {status === "checking" ? "Testing Connection..." : "Save & Test Health"}
              </button>
            </div>

            {status === "connected" && (
              <div className="bg-sky/10 border border-sky/30 rounded-xl p-3.5 text-xs text-sky font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky animate-ping" />
                Connected successfully. /health responded OK.
              </div>
            )}
            {status === "failed" && (
              <div className="bg-brick/10 border border-brick/30 rounded-xl p-3.5 text-xs text-brick leading-relaxed">
                Couldn&apos;t reach that endpoint. Please verify your FastAPI service is running
                and that ngrok is forwarding port 8000.
              </div>
            )}
          </div>

          {/* Architecture Reference from README */}
          <div className="xl:col-span-6 flex flex-col gap-4">
            <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs">
              <h3 className="font-display text-lg text-ink mb-3">Tech Stack &amp; Shared Services</h3>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-paper rounded-lg border border-paperDark">
                  <span className="font-medium text-ink">Backend Engine</span>
                  <span className="text-ink/65">FastAPI (Python)</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-paper rounded-lg border border-paperDark">
                  <span className="font-medium text-ink">AI Matching</span>
                  <span className="text-purple font-semibold">CLIP Embeddings</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-paper rounded-lg border border-paperDark">
                  <span className="font-medium text-ink">Database</span>
                  <span className="text-ink/65">MongoDB</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-paper rounded-lg border border-paperDark">
                  <span className="font-medium text-ink">Image Storage</span>
                  <span className="text-sky font-semibold">Cloudinary</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-paper rounded-lg border border-paperDark">
                  <span className="font-medium text-ink">Blood Alert Broadcast</span>
                  <span className="text-brick font-semibold">SMTP Email Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}