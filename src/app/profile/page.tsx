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
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
      {/* Profile summary */}
      <aside className="flex flex-col gap-6">
        <div className="bg-white border border-paperDark rounded-xl p-6 flex flex-col items-center text-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Profile"}
              className="w-20 h-20 rounded-full border border-paperDark"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-purple text-white flex items-center justify-center text-2xl font-medium">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <p className="font-display text-lg">{session?.user?.name}</p>
            <p className="text-sm text-ink/50">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-brick hover:underline mt-2"
          >
            Sign out
          </button>
        </div>

        <div className="tag-card tag-card--found p-5">
          <p className="text-xs uppercase tracking-wide text-sky mb-1">
            Account status
          </p>
          <p className="text-sm text-ink/70">Signed in with Google</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-2xl">Your activity</h1>

        <div className="bg-white border border-paperDark rounded-xl p-6 flex flex-col gap-3">
          <h2 className="font-display text-lg">My Lost &amp; Found reports</h2>
          <div className="border border-dashed border-paperDark rounded-xl py-10 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-ink/60">
              Once connected to the backend, items you've reported lost or
              found will show up here.
            </p>
          </div>
        </div>

        <div className="bg-white border border-paperDark rounded-xl p-6 flex flex-col gap-3">
          <h2 className="font-display text-lg">My Blood Alert requests</h2>
          <div className="border border-dashed border-paperDark rounded-xl py-10 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-ink/60">
              Blood alert requests you've sent will appear here once the
              backend is connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}