"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col gap-14 py-4">
      <section className="hero-gradient rounded-3xl px-10 py-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
        <div>
          <p className="text-sm text-blue font-medium mb-3">
            A campus system for the moments that need a level head
          </p>
          <h1 className="font-display text-5xl leading-tight mb-6">
            Lost something?
            <br />
            Needed somewhere?
            <br />
            Stay composed.
          </h1>
          <p className="text-ink/70 text-lg max-w-md mb-8">
            One place to report what's missing, quietly verify who it
            belongs to, and reach the right people fast when blood is
            needed.
          </p>

          {session ? (
            <Link
              href="/profile"
              className="inline-block bg-purple text-white px-6 py-3 rounded-full text-sm hover:bg-blue transition-colors"
            >
              Go to your profile
            </Link>
          ) : (
            <Link
              href="/signin"
              className="inline-block bg-purple text-white px-6 py-3 rounded-full text-sm hover:bg-blue transition-colors"
            >
              Sign in to get started
            </Link>
          )}
        </div>

        <div className="bg-white/70 border border-white rounded-2xl p-6 flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wide text-purple">
            Built for campus
          </p>
          <div className="flex flex-col gap-3 text-sm text-ink/70">
            <div className="flex justify-between border-b border-paperDark pb-3">
              <span>Verified matches only</span>
              <span className="text-sky font-medium">Private</span>
            </div>
            <div className="flex justify-between border-b border-paperDark pb-3">
              <span>Blood alerts</span>
              <span className="text-brick font-medium">Direct to staff</span>
            </div>
            <div className="flex justify-between">
              <span>Sign in</span>
              <span className="text-blue font-medium">Google account</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/lost-found"
          className="tag-card tag-card--found p-6 flex flex-col gap-2 hover:shadow-sm transition-shadow"
        >
          <span className="text-xs uppercase tracking-wide text-sky">Everyday</span>
          <h2 className="font-display text-2xl">Lost &amp; Found</h2>
          <p className="text-sm text-ink/60">
            Report a missing item or something you've found. Matches are
            made quietly — no browsing other people's claims.
          </p>
        </Link>

        <Link
          href="/blood-alert"
          className="tag-card tag-card--lost p-6 flex flex-col gap-2 hover:shadow-sm transition-shadow"
        >
          <span className="text-xs uppercase tracking-wide text-brick">Urgent</span>
          <h2 className="font-display text-2xl">Blood Alert</h2>
          <p className="text-sm text-ink/60">
            Send a request straight to available staff in your department
            by email — direct, and fast.
          </p>
        </Link>
      </section>
    </div>
  );
}