"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getApiClient } from "@/lib/apiClient";
import {
  Droplet,
  ShieldCheck,
  AlertCircle,
  Clock,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodAlertPage() {
  const { data: session, status: authStatus } = useSession();
  const [studentName, setStudentName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (session?.user?.name && !studentName) {
      setStudentName(session.user.name);
    }
  }, [session, studentName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      alert("Please sign in with your college account to send an alert.");
      return;
    }
    setSubmitting(true);
    setStatus("idle");
    try {
      const api = getApiClient();
      await api.post("/blood-alert", {
        studentName,
        bloodType,
        phoneNumber,
        department,
        senderEmail: session.user?.email,
      });
      setStatus("success");
      setBloodType("");
      setPhoneNumber("");
      setDepartment("");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6">
        <div className="tag-card tag-card--lost p-5" style={{ borderColor: "#B8433D" }}>
          <p className="text-xs uppercase tracking-wider font-semibold text-brick mb-1">
            Urgent Campus Broadcast
          </p>
          <h3 className="font-display text-lg mb-2">How it delivers</h3>
          <p className="text-sm text-ink/70 leading-relaxed">
            Your request is emailed immediately to faculty and staff in your department
            via verified campus SMTP — zero lag, no waiting for a moderator.
          </p>
        </div>

        <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider font-semibold text-purple mb-3">
            Blood Type Compatibility
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {BLOOD_TYPES.map((bt) => (
              <button
                type="button"
                key={bt}
                onClick={() => setBloodType(bt)}
                className={`border rounded-lg py-2 text-sm font-semibold transition-all ${
                  bloodType === bt
                    ? "bg-brick text-white border-brick shadow-xs"
                    : "bg-paper border-paperDark text-ink/70 hover:border-brick"
                }`}
              >
                {bt}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink/50 mt-3">
            Click any type to pre-select it in your request.
          </p>
        </div>

        <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wider font-semibold text-ink/60">
            Emergency Guidelines
          </p>
          <div className="flex items-start gap-2.5 text-xs text-ink/70">
            <Clock className="w-4 h-4 text-purple shrink-0 mt-0.5" />
            <span>Staff members receive instant email notifications on campus network.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-ink/70">
            <Building2 className="w-4 h-4 text-sky shrink-0 mt-0.5" />
            <span>Direct contact only: responders will call the provided phone number.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-ink/70">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Traceable to your authenticated college account to eliminate hoaxes.</span>
          </div>
        </div>
      </aside>

      {/* Main Panel — Responsive 2-column layout to utilize wide displays */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl">Blood Alert Notification</h1>
          <p className="text-sm text-ink/65 mt-1 max-w-2xl">
            Submit an emergency requirement. An automated broadcast will be dispatched to
            available staff and donors in your department immediately.
          </p>
        </div>

        {/* Authentication Notice / Verified State */}
        {!session ? (
          <div className="bg-paperDark/60 border border-paperDark rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-brick/10 flex items-center justify-center text-brick shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-base font-semibold text-ink">
                  Campus Authentication Required
                </h4>
                <p className="text-xs text-ink/65 mt-1 max-w-lg leading-relaxed">
                  To prevent unauthorized or fake emergency alerts, all blood broadcast
                  requests must be sent by verified students or faculty using their college account.
                </p>
              </div>
            </div>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 bg-purple text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors shrink-0 shadow-xs"
            >
              Sign in to Send Alert
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-900 font-medium">
                Verified Campus Member: <strong>{session.user?.name}</strong> ({session.user?.email})
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold">
              Authorized Sender
            </span>
          </div>
        )}

        {/* Form and Context Information Grid (utilizes wide screens) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="xl:col-span-7 bg-white border border-paperDark rounded-2xl p-6 sm:p-8 shadow-xs">
            <h3 className="font-display text-xl mb-4 text-ink">Request Details</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-ink/70 block mb-1.5">
                  Student / Patient Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  disabled={!session}
                  className="w-full border border-paperDark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender disabled:bg-paper disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink/70 block mb-1.5">
                    Required Blood Type
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    required
                    disabled={!session}
                    className="w-full border border-paperDark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white disabled:bg-paper disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>
                      Select Blood Group
                    </option>
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-ink/70 block mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={!session}
                    className="w-full border border-paperDark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender disabled:bg-paper disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-ink/70 block mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Applications / Information Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  disabled={!session}
                  className="w-full border border-paperDark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender disabled:bg-paper disabled:cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                {session ? (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brick text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xs"
                  >
                    <Droplet className="w-4 h-4" />
                    {submitting ? "Broadcasting to Staff..." : "Send Emergency Alert"}
                  </button>
                ) : (
                  <Link
                    href="/signin"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ink text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-purple transition-colors shadow-xs"
                  >
                    <Lock className="w-4 h-4" />
                    Sign in to Broadcast Alert
                  </Link>
                )}
              </div>

              {status === "success" && (
                <div className="mt-3 bg-sky/10 border border-sky/30 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky shrink-0 mt-0.5" />
                  <p className="text-xs text-ink/80 leading-relaxed">
                    <strong>Alert broadcasted successfully.</strong> Staff members in your
                    department have received the notification email and will reach out directly to
                    your contact number.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mt-3 bg-brick/10 border border-brick/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-brick shrink-0 mt-0.5" />
                  <p className="text-xs text-brick leading-relaxed">
                    Couldn&apos;t broadcast the alert. Check your backend connection in Settings
                    or verify SMTP credentials.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Right Protocol & FAQ Panel */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-display text-lg text-ink">Protocol &amp; Dispatch Rules</h3>
              <div className="flex flex-col gap-3 text-xs text-ink/75 leading-relaxed">
                <div className="p-3 bg-paper rounded-xl border border-paperDark">
                  <strong className="text-ink block mb-1">1. Direct Department Routing</strong>
                  Broadcasts avoid campus-wide spam by alerting only staff affiliated with the specified department.
                </div>
                <div className="p-3 bg-paper rounded-xl border border-paperDark">
                  <strong className="text-ink block mb-1">2. No Trailing Availability Trackers</strong>
                  Faculty call your number directly to coordinate donation, keeping logistics frictionless.
                </div>
                <div className="p-3 bg-paper rounded-xl border border-paperDark">
                  <strong className="text-ink block mb-1">3. Privacy Guarantee</strong>
                  Alert details are strictly internal to authenticated campus faculty and are not posted on public boards.
                </div>
              </div>
            </div>

            <div className="hero-gradient border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple">
                Need Blood Fast?
              </span>
              <p className="text-xs text-ink/75 leading-relaxed">
                For life-critical emergencies, also notify the nearest Campus Health Center or NSS/NCC emergency desk directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}