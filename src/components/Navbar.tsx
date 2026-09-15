"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Smartphone } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-paperDark bg-paper">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/stay_composed.png"
            alt="Stay Composed Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-xl transition-transform group-hover:scale-105 drop-shadow-sm"
          />
          <span className="font-display text-xl sm:text-2xl text-ink tracking-tight font-semibold">
            Stay Composed
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 text-sm">
          <Link href="/true-owner" className="text-ink/70 hover:text-purple transition-colors font-medium">
            True Owner
          </Link>
          <Link href="/blood-alert" className="text-ink/70 hover:text-blue transition-colors">
            Blood Alert
          </Link>
          <Link href="/settings" className="text-ink/70 hover:text-purple transition-colors">
            Settings
          </Link>
          <a
            href="/downloads/stay-composed-app.apk"
            download="StayComposed-v1.0.apk"
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-2xs"
            title="Download Stay Composed Android App (APK)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xs:inline">App</span> APK
          </a>

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