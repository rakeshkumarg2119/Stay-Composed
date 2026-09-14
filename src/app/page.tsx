"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Search,
  Droplet,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  MapPin,
  EyeOff,
  UserCheck,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col gap-12 sm:gap-16 py-2">
      {/* Hero Section */}
      <section className="hero-gradient rounded-3xl p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-paperDark px-3.5 py-1.5 rounded-full mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky animate-pulse" />
            <span className="text-xs text-blue font-medium tracking-wide">
              Campus AI Verification &amp; Emergency Network
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mb-6">
            Lost something?
            <br />
            Needed somewhere?
            <br />
            <span className="text-purple">Stay composed.</span>
          </h1>

          <p className="text-ink/75 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
            One calm place to report what&apos;s missing, quietly verify who it belongs to
            using AI and secret challenges, and reach the right department staff fast
            when blood is urgently needed.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 bg-purple text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-blue transition-all shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  Your Profile &amp; Claims
                </Link>
                <Link
                  href="/lost-found"
                  className="inline-flex items-center gap-2 bg-white text-ink border border-paperDark px-5 py-3.5 rounded-full text-sm font-medium hover:border-purple hover:text-purple transition-all shadow-xs"
                >
                  Report / Check Items
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 bg-purple text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-blue transition-all shadow-xs"
                >
                  Sign in with College Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/lost-found"
                  className="inline-flex items-center gap-2 bg-white text-ink border border-paperDark px-5 py-3.5 rounded-full text-sm font-medium hover:border-purple transition-all shadow-xs"
                >
                  Explore Lost &amp; Found
                </Link>
              </>
            )}
          </div>

          {!session && (
            <p className="text-xs text-ink/50 mt-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple" />
              Sign in unlocks private AI reporting, claim challenges, and emergency blood broadcast.
            </p>
          )}
        </div>

        {/* Hero Right: Campus Trust & System Architecture Card */}
        <div className="lg:col-span-5 bg-white/85 backdrop-blur-xs border border-white/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-paperDark">
            <span className="text-xs uppercase tracking-wider font-semibold text-purple">
              Built For Campus Safety
            </span>
            <span className="text-[11px] bg-paperDark/80 text-ink/70 px-2.5 py-1 rounded-full font-medium">
              CLIP AI + SMTP
            </span>
          </div>

          <div className="flex flex-col gap-3.5 text-sm">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-paperDark">
              <div className="flex flex-col">
                <span className="font-medium text-ink">AI CLIP Matching</span>
                <span className="text-xs text-ink/60">Image &amp; text embedding comparison</span>
              </div>
              <span className="text-sky text-xs font-semibold bg-sky/10 px-2.5 py-1 rounded-md">
                Private
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 pb-3 border-b border-paperDark">
              <div className="flex flex-col">
                <span className="font-medium text-ink">Secret-Detail Challenge</span>
                <span className="text-xs text-ink/60">Hashed at rest &bull; Multi-field proof</span>
              </div>
              <span className="text-purple text-xs font-semibold bg-purple/10 px-2.5 py-1 rounded-md">
                Anti-Fraud
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 pb-3 border-b border-paperDark">
              <div className="flex flex-col">
                <span className="font-medium text-ink">Emergency Blood Alerts</span>
                <span className="text-xs text-ink/60">Direct broadcast to department staff</span>
              </div>
              <span className="text-brick text-xs font-semibold bg-brick/10 px-2.5 py-1 rounded-md">
                Direct Email
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-ink">Zero Public Browsing</span>
                <span className="text-xs text-ink/60">No claim shopping or identity leaks</span>
              </div>
              <span className="text-blue text-xs font-semibold bg-blue/10 px-2.5 py-1 rounded-md">
                Masked ID
              </span>
            </div>
          </div>

          {session ? (
            <div className="mt-2 bg-paper rounded-xl p-3.5 border border-paperDark flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-ink/75 font-medium">Signed in as {session.user?.name}</span>
              </div>
              <Link href="/profile" className="text-purple font-semibold hover:underline">
                View Account &rarr;
              </Link>
            </div>
          ) : (
            <div className="mt-2 bg-paper rounded-xl p-3.5 border border-paperDark flex items-center justify-between text-xs text-ink/70">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple" />
                OAuth restricted to campus accounts
              </span>
              <Link href="/signin" className="text-purple font-semibold hover:underline">
                Sign in &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Primary Action & Portal Cards (4-Column Layout utilizing wide screens) */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-purple mb-1">
              Core Campus Hubs
            </p>
            <h2 className="font-display text-2xl sm:text-3xl">What would you like to do?</h2>
          </div>
          <p className="text-sm text-ink/60 max-w-sm">
            Everything is quiet, authenticated, and built to avoid public chaos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Lost Item */}
          <Link
            href="/lost-found"
            className="tag-card tag-card--lost p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-purple">
                  Lost Item
                </span>
                <div className="w-8 h-8 rounded-full bg-purple/10 flex items-center justify-center text-purple group-hover:bg-purple group-hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 group-hover:text-purple transition-colors">
                I lost something
              </h3>
              <p className="text-sm text-ink/65 leading-relaxed">
                Log what you lost with photos and description. CLIP AI quietly scans for matching reports.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-purple">
              <span>Report missing item</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Found Item */}
          <Link
            href="/lost-found"
            className="tag-card tag-card--found p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group bg-white"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-sky">
                  Found Item
                </span>
                <div className="w-8 h-8 rounded-full bg-sky/10 flex items-center justify-center text-sky group-hover:bg-sky group-hover:text-white transition-colors">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 group-hover:text-sky transition-colors">
                I found something
              </h3>
              <p className="text-sm text-ink/65 leading-relaxed">
                Safely register an item. It stays unlisted until the true owner answers your secret-detail challenge.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-sky">
              <span>Safely hand over</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Blood Alert */}
          <Link
            href="/blood-alert"
            className="tag-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group bg-white relative overflow-hidden"
            style={{ borderLeftColor: "#B8433D" }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-brick">
                  Urgent
                </span>
                <div className="w-8 h-8 rounded-full bg-brick/10 flex items-center justify-center text-brick group-hover:bg-brick group-hover:text-white transition-colors">
                  <Droplet className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 group-hover:text-brick transition-colors">
                Blood Donation Alert
              </h3>
              <p className="text-sm text-ink/65 leading-relaxed">
                Emergency requirement? Instantly email verified faculty in your department without public panic.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-brick">
              <span>Send emergency alert</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Verification & Profile */}
          <Link
            href={session ? "/profile" : "/signin"}
            className="tag-card p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all group bg-white"
            style={{ borderLeftColor: "#3E63DD" }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-blue">
                  Verified Identity
                </span>
                <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue group-hover:bg-blue group-hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 group-hover:text-blue transition-colors">
                {session ? "My Activity & Claims" : "Campus Authentication"}
              </h3>
              <p className="text-sm text-ink/65 leading-relaxed">
                {session
                  ? "Track your submitted reports, monitor matching alerts, and review active handovers."
                  : "Sign in with your campus Google account to unlock all reporting, matching, and alert capabilities."}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue">
              <span>{session ? "View your profile" : "Sign in now"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* How Stay Composed Works: 4-Step Process Section */}
      <section className="bg-white border border-paperDark rounded-3xl p-6 sm:p-10 lg:p-12">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-wider font-semibold text-purple mb-2">
            The AI-Verification Loop
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-ink mb-3">
            How items are reunited quietly — without panic or fraud
          </h2>
          <p className="text-sm text-ink/70 leading-relaxed">
            Unlike public message boards where anyone can claim an item, Stay Composed
            relies on multi-modal AI matching and cryptographic secret-detail challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="flex flex-col bg-paper/60 border border-paperDark rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-display font-semibold text-purple">01</span>
              <div className="w-7 h-7 rounded-full bg-purple/10 flex items-center justify-center text-purple">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="font-display text-lg mb-2">Report Privately</h4>
            <p className="text-xs text-ink/65 leading-relaxed">
              Submit description and optional photo. Reports are not browsable by the public to prevent fake claims.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col bg-paper/60 border border-paperDark rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-display font-semibold text-sky">02</span>
              <div className="w-7 h-7 rounded-full bg-sky/10 flex items-center justify-center text-sky">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="font-display text-lg mb-2">CLIP AI Matching</h4>
            <p className="text-xs text-ink/65 leading-relaxed">
              Text and vision embeddings compare candidate matches and produce confidence ranks rather than binary guesses.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col bg-paper/60 border border-paperDark rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-display font-semibold text-blue">03</span>
              <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="font-display text-lg mb-2">Secret Challenge</h4>
            <p className="text-xs text-ink/65 leading-relaxed">
              The claimant must answer specific hashed questions only the owner knows. Details are never stored in plaintext.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col bg-paper/60 border border-paperDark rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-display font-semibold text-brick">04</span>
              <div className="w-7 h-7 rounded-full bg-brick/10 flex items-center justify-center text-brick">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="font-display text-lg mb-2">Safe Handover</h4>
            <p className="text-xs text-ink/65 leading-relaxed">
              Coordinate exchange at designated campus spots (Library, Admin block). Structured chat auto-closes once complete.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Privacy & Safety Principles (3 Columns) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-paperDark rounded-2xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center text-purple">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg">Reveal Only What&apos;s Necessary</h3>
          <p className="text-sm text-ink/65 leading-relaxed">
            Phone numbers, roll numbers, and department details remain masked. The system only connects parties when proof of ownership is mathematically established.
          </p>
        </div>

        <div className="bg-white border border-paperDark rounded-2xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky/10 flex items-center justify-center text-sky">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg">System-Driven Matching</h3>
          <p className="text-sm text-ink/65 leading-relaxed">
            No public claims feed or browsing other students&apos; lost reports. This eliminates &ldquo;fishing&rdquo; for secret details and keeps reports strictly confidential.
          </p>
        </div>

        <div className="bg-white border border-paperDark rounded-2xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-brick/10 flex items-center justify-center text-brick">
            <Droplet className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg">Direct Faculty Alerts</h3>
          <p className="text-sm text-ink/65 leading-relaxed">
            Emergency blood alerts are routed directly via SMTP to verified staff in the student&apos;s department, enabling fast, direct contact without chaotic group forwards.
          </p>
        </div>
      </section>
    </div>
  );
}