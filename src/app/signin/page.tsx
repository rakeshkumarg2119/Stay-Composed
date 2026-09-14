"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-[70vh] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div className="hidden lg:flex flex-col gap-4">
        <p className="text-sm text-blue font-medium">Before you continue</p>
        <h1 className="font-display text-4xl leading-tight">
          One account.
          <br />
          Every report, kept private.
        </h1>
        <p className="text-ink/60 max-w-sm">
          Signing in with your college Google account links reports to you
          without exposing your details to other students — matches happen
          quietly, behind the scenes.
        </p>
      </div>

      <div className="hero-gradient border border-paperDark rounded-2xl p-10 flex flex-col items-center gap-6 text-center">
        <span className="font-display text-2xl">Stay Composed</span>
        <p className="text-sm text-ink/60">
          Sign in with your college Google account to report items or send
          a blood alert.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/profile" })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-paperDark rounded-lg px-4 py-3 text-sm font-medium hover:border-purple hover:shadow-sm transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6.1 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4c-2 1.5-4.6 2.5-7.6 2.5-5.3 0-9.8-3.4-11.3-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4 5.5l6.6 5.4C41.4 36 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-ink/40">
          We only use your name, email, and profile photo.
        </p>
      </div>
    </div>
  );
}