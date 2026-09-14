"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-paperDark bg-paper">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-xl">
          Stay Composed
        </Link>
        <div className="flex items-center gap-8 text-sm">
          <Link href="/true-owner" className="text-ink/70 hover:text-purple transition-colors font-medium">
            True Owner
          </Link>
          <Link href="/blood-alert" className="text-ink/70 hover:text-blue transition-colors">
            Blood Alert
          </Link>
          <Link href="/settings" className="text-ink/70 hover:text-purple transition-colors">
            Settings
          </Link>

          {session ? (
            <Link href="/profile" className="flex items-center gap-2">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Profile"}
                  className="w-8 h-8 rounded-full border border-paperDark"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center text-xs font-medium">
                  {session.user?.name?.[0] ?? "U"}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="bg-purple text-white px-4 py-1.5 rounded-full hover:bg-blue transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}