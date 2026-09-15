"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ShieldCheck, UserCheck, Key, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function SignInPage() {
  const [demoName, setDemoName] = useState("Praveen Kumar");
  const [demoEmail, setDemoEmail] = useState("praveen.student@bmsce.ac.in");
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  async function handleDemoSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSigningIn(true);
    try {
      const res = await signIn("campus-demo", {
        name: demoName,
        email: demoEmail,
        redirect: false,
        callbackUrl: "/true-owner",
      });
      if (res?.ok) {
        window.location.href = res.url || "/true-owner";
        return;
      }
    } catch (err) {
      console.error("Sign-in failed:", err);
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="min-h-[75vh] grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      {/* Left Info Panel */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        <div className="inline-flex items-center gap-2 bg-white border border-paperDark px-3 py-1 rounded-full text-xs font-semibold text-purple self-start shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-purple" />
          Verified Campus Authentication
        </div>

        <h1 className="font-display text-4xl sm:text-5xl leading-tight text-ink">
          One account.
          <br />
          Every report, <span className="text-purple">kept private.</span>
        </h1>

        <p className="text-ink/75 text-base sm:text-lg max-w-lg leading-relaxed">
          Signing in links complaints and emergency broadcasts to your verified campus identity
          while keeping your identity masked from other students.
        </p>

        <div className="flex flex-col gap-3 text-xs text-ink/70">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-purple" />
            <span><strong>True Owner:</strong> File secret-verification complaints and view matched items.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-brick" />
            <span><strong>Blood Alert:</strong> Direct broadcast to department faculty via SMTP.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky" />
            <span><strong>Zero Public Exposure:</strong> Display names masked, secret details hashed.</span>
          </div>
        </div>
      </div>

      {/* Right Sign-in Cards */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        <div className="bg-white border border-paperDark rounded-3xl p-8 sm:p-10 flex flex-col gap-6 shadow-xs">
          <div className="text-center">
            <span className="font-display text-2xl text-ink">Stay Composed</span>
            <p className="text-xs sm:text-sm text-ink/60 mt-1">
              Sign in with your campus account to proceed.
            </p>
          </div>

          {/* Option 1: Google OAuth */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/true-owner" })}
              className="w-full flex items-center justify-center gap-3 bg-white border border-paperDark rounded-2xl px-5 py-3.5 text-sm font-semibold hover:border-purple hover:shadow-sm transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6.1 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4c-2 1.5-4.6 2.5-7.6 2.5-5.3 0-9.8-3.4-11.3-8.1l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4 5.5l6.6 5.4C41.4 36 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5z"/>
              </svg>
              Continue with Google OAuth
            </button>
            <p className="text-[11px] text-ink/50 text-center">
              Requires <code>GOOGLE_CLIENT_ID</code> in <code>.env.local</code>.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-paperDark"></div>
            <span className="flex-shrink mx-4 text-xs uppercase font-semibold text-ink/40 tracking-wider">or instant demo</span>
            <div className="flex-grow border-t border-paperDark"></div>
          </div>

          {/* Option 2: Instant Campus Test Login */}
          <form onSubmit={handleDemoSignIn} className="flex flex-col gap-3 bg-paper p-4 rounded-2xl border border-paperDark">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <UserCheck className="w-3.5 h-3.5 text-purple" />
              <span>Campus Quick Test Sign-in (Ready Now)</span>
            </div>
            <input
              type="text"
              placeholder="Your Full Name"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              required
              className="w-full bg-white border border-paperDark rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lavender"
            />
            <input
              type="email"
              placeholder="Campus Email"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              required
              className="w-full bg-white border border-paperDark rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-lavender"
            />
            <button
              type="submit"
              disabled={signingIn}
              className="w-full bg-purple text-white py-2 rounded-xl text-xs font-semibold hover:bg-blue transition-colors disabled:opacity-50 shadow-xs"
            >
              {signingIn ? "Authenticating..." : "Sign in as Campus Member &rarr;"}
            </button>
          </form>

          {/* Collapsible Setup Guide */}
          <div className="border-t border-paperDark pt-3">
            <button
              type="button"
              onClick={() => setShowOAuthGuide(!showOAuthGuide)}
              className="w-full flex items-center justify-between text-xs text-purple font-medium hover:underline"
            >
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                How to set up Google OAuth in 2 minutes
              </span>
              {showOAuthGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOAuthGuide && (
              <div className="mt-3 bg-paper p-4 rounded-xl border border-paperDark text-xs text-ink/75 flex flex-col gap-2 leading-relaxed">
                <p className="font-semibold text-ink">Google Cloud Console Steps:</p>
                <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-[11px]">
                  <li>Visit <strong>console.cloud.google.com</strong> and create a project.</li>
                  <li>Go to <strong>APIs &amp; Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.</li>
                  <li>Application type: <strong>Web application</strong>.</li>
                  <li>Authorized JavaScript origins: <code>http://localhost:3000</code></li>
                  <li>Authorized redirect URIs: <code>http://localhost:3000/api/auth/callback/google</code></li>
                  <li>Copy the Client ID and Client Secret into your <code>.env.local</code> file.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}