"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { Menu, X, ShieldCheck, Droplet, Settings, User, Download } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-paperDark bg-paper sticky top-0 z-40">
      <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <img
            src="/stay_composed.png"
            alt="Stay Composed Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl transition-transform group-hover:scale-105 drop-shadow-xs"
          />
          <span className="font-display text-lg sm:text-2xl text-ink tracking-tight font-semibold">
            Stay Composed
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium">
          <Link
            href="/true-owner"
            className={`transition-colors ${
              isActive("/true-owner") ? "text-purple font-semibold" : "text-ink/75 hover:text-purple"
            }`}
          >
            True Owner
          </Link>
          <Link
            href="/blood-alert"
            className={`transition-colors ${
              isActive("/blood-alert") ? "text-blue font-semibold" : "text-ink/75 hover:text-blue"
            }`}
          >
            Blood Alert
          </Link>
          <Link
            href="/settings"
            className={`transition-colors ${
              isActive("/settings") ? "text-purple font-semibold" : "text-ink/75 hover:text-purple"
            }`}
          >
            Settings
          </Link>

          <a
            href="/downloads/stay_composed_v1.apk"
            download="StayComposed-v1.0.apk"
            className="inline-flex items-center gap-1.5 bg-paperDark text-ink/80 hover:text-purple hover:bg-purple/10 border border-paperDark px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs shrink-0"
            title="Download Stay Composed Android App (APK)"
          >
            <Download className="w-3.5 h-3.5 text-purple" />
            <span>Download APK</span>
          </a>

          {/* Real-Time Notification Bell */}
          {session && <NotificationDropdown />}

          {session ? (
            <Link href="/profile" className="flex items-center gap-2" title={session.user?.name ?? "My Profile"}>
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Profile"}
                  className="w-8 h-8 rounded-full border border-paperDark object-cover shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple text-white flex items-center justify-center text-xs font-medium shadow-2xs">
                  {session.user?.name?.[0] ?? "U"}
                </div>
              )}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="bg-purple text-white px-4 py-1.5 rounded-full hover:bg-blue transition-colors text-xs sm:text-sm font-medium shadow-2xs"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile Header Controls (Notification + Hamburger) */}
        <div className="flex md:hidden items-center gap-2">
          {session && <NotificationDropdown />}

          {session && (
            <Link href="/profile" onClick={closeMenu} className="p-1">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? "Profile"}
                  className="w-7 h-7 rounded-full border border-paperDark object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple text-white flex items-center justify-center text-[10px] font-bold">
                  {session.user?.name?.[0] ?? "U"}
                </div>
              )}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-ink/80 hover:bg-paperDark/60 transition-colors focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-ink" /> : <Menu className="w-6 h-6 text-ink" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-paperDark px-4 pt-3 pb-6 flex flex-col gap-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            <Link
              href="/true-owner"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive("/true-owner") ? "bg-purple/10 text-purple font-semibold" : "text-ink/80 hover:bg-paper"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple" />
              True Owner (Lost &amp; Found)
            </Link>

            <Link
              href="/blood-alert"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive("/blood-alert") ? "bg-blue/10 text-blue font-semibold" : "text-ink/80 hover:bg-paper"
              }`}
            >
              <Droplet className="w-4 h-4 text-brick" />
              Blood Alert
            </Link>

            <Link
              href="/settings"
              onClick={closeMenu}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive("/settings") ? "bg-purple/10 text-purple font-semibold" : "text-ink/80 hover:bg-paper"
              }`}
            >
              <Settings className="w-4 h-4 text-ink/60" />
              Settings &amp; Connection
            </Link>

            {session ? (
              <Link
                href="/profile"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive("/profile") ? "bg-purple/10 text-purple font-semibold" : "text-ink/80 hover:bg-paper"
                }`}
              >
                <User className="w-4 h-4 text-purple" />
                My Profile &amp; Reports ({session.user?.name || "User"})
              </Link>
            ) : (
              <Link
                href="/signin"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 bg-purple text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue transition-colors mt-2 shadow-xs"
              >
                Sign in with Campus Account
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-paperDark flex items-center justify-between">
            <span className="text-xs text-ink/60">Download Android App</span>
            <a
              href="/downloads/stay_composed_v1.apk"
              download="StayComposed-v1.0.apk"
              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              APK (v1.0)
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}