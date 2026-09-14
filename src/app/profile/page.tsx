"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-ink/50">Loading profile...</p>;
  }

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
      {/* Profile summary */}
      <aside className="flex flex-col gap-6">
        <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col items-center text-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Profile"}
              className="w-20 h-20 rounded-full border border-paperDark shadow-xs"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple text-white flex items-center justify-center text-2xl font-medium shadow-xs">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <p className="font-display text-xl">{session?.user?.name}</p>
            <p className="text-xs text-ink/50 mt-0.5">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-brick hover:underline font-medium mt-1"
          >
            Sign out of account
          </button>
        </div>

        <div className="tag-card tag-card--found p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-sky mb-1">
            Account Status
          </p>
          <p className="text-sm text-ink/75 font-medium">Verified Campus Member</p>
          <p className="text-xs text-ink/55 mt-1">
            Google OAuth linked to university credentials.
          </p>
        </div>
      </aside>

      {/* Main content — Responsive Grid */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Your Campus Activity</h1>
            <p className="text-sm text-ink/65 mt-1">
              Manage your active lost-and-found listings and emergency blood broadcasts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">My Lost &amp; Found reports</h2>
              <span className="text-xs bg-paper px-2.5 py-1 rounded-full text-ink/60 font-medium">
                0 Active
              </span>
            </div>
            <div className="border border-dashed border-paperDark rounded-xl py-12 flex flex-col items-center gap-2 text-center bg-paper/30">
              <p className="text-xs text-ink/60 max-w-xs">
                Items you report lost or found will appear here with live CLIP match status and verification alerts.
              </p>
            </div>
          </div>

          <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">My Blood Alert requests</h2>
              <span className="text-xs bg-paper px-2.5 py-1 rounded-full text-ink/60 font-medium">
                0 Broadcasts
              </span>
            </div>
            <div className="border border-dashed border-paperDark rounded-xl py-12 flex flex-col items-center gap-2 text-center bg-paper/30">
              <p className="text-xs text-ink/60 max-w-xs">
                Emergency blood broadcasts dispatched under your account will be tracked here with department dispatch logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}