"use client";

import { useState, useEffect, useRef } from "react";
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
  Trash2,
  Plus,
  Users,
  Mail,
  RefreshCw,
} from "lucide-react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Others"];

export default function BloodAlertPage() {
  const { data: session, status: authStatus } = useSession();
  const [studentName, setStudentName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [otherBloodType, setOtherBloodType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Staff and Judge live broadcast directory
  const [staffList, setStaffList] = useState<string[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);
  const [staffActionMsg, setStaffActionMsg] = useState<string | null>(null);

  const hasInitializedName = useRef(false);

  useEffect(() => {
    if (session?.user?.name && !hasInitializedName.current) {
      setStudentName(session.user.name);
      hasInitializedName.current = true;
    }
  }, [session?.user?.name]);

  useEffect(() => {
    fetchStaffList();
  }, []);

  async function fetchStaffList() {
    setLoadingStaff(true);
    try {
      const api = getApiClient();
      const res = await api.get("/blood-alert/staff");
      const raw = res.data;
      let emails: string[] = [];
      if (Array.isArray(raw)) {
        emails = raw.map((item) => (typeof item === "string" ? item : item.email)).filter(Boolean);
      } else if (Array.isArray(raw?.staff)) {
        emails = raw.staff;
      }
      setStaffList(emails);
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setLoadingStaff(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaffEmail.trim()) return;
    setAddingStaff(true);
    try {
      const api = getApiClient();
      await api.post("/blood-alert/staff", { email: newStaffEmail.trim() });
      setStaffActionMsg(`Added ${newStaffEmail.trim()} to active broadcast list.`);
      setNewStaffEmail("");
      await fetchStaffList();
      setTimeout(() => setStaffActionMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to add email recipient.");
    } finally {
      setAddingStaff(false);
    }
  }

  async function handleRemoveStaff(emailToRemove: string) {
    try {
      const api = getApiClient();
      await api.delete(`/blood-alert/staff/${encodeURIComponent(emailToRemove)}`);
      setStaffActionMsg(`Removed ${emailToRemove} from broadcast list.`);
      await fetchStaffList();
      setTimeout(() => setStaffActionMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to remove email recipient.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) {
      alert("Please sign in with your college account to send an alert.");
      return;
    }
    const resolvedBloodType =
      bloodType === "Others" ? otherBloodType.trim() || "Rare / Custom Type" : bloodType;

    setSubmitting(true);
    setStatus("idle");
    try {
      const api = getApiClient();
      await api.post("/blood-alert", {
        studentName,
        bloodType: resolvedBloodType,
        phoneNumber,
        scope: "campus-wide-all-departments",
        senderEmail: session.user?.email,
      });
      setStatus("success");
      setBloodType("");
      setOtherBloodType("");
      setPhoneNumber("");
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6 order-2 lg:order-1">
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
      <div className="flex flex-col gap-6 order-1 lg:order-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Blood Alert Notification</h1>
          <p className="text-xs sm:text-sm text-ink/65 mt-1 max-w-2xl leading-relaxed">
            Submit an emergency requirement. An automated broadcast will be dispatched to
            available staff and donors in your department immediately.
          </p>
        </div>

        {/* Authentication Notice / Verified State */}
        {!session ? (
          <div className="bg-paperDark/60 border border-paperDark rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-emerald-900 font-medium">
                Verified Campus Member: <strong>{session.user?.name}</strong> ({session.user?.email})
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold self-start sm:self-auto">
              Authorized Sender
            </span>
          </div>
        )}

        {/* Form and Context Information Grid (utilizes wide screens) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Form & Directory Column */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            <div className="bg-white border border-paperDark rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
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

                {bloodType === "Others" && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-brick block mb-1.5">
                      Specify Rare / Custom Blood Group *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bombay Blood Group (hh), Rh-null, Kell (K+), Colton, etc."
                      value={otherBloodType}
                      onChange={(e) => setOtherBloodType(e.target.value)}
                      required
                      disabled={!session}
                      className="w-full border border-brick/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white disabled:bg-paper"
                    />
                  </div>
                )}
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

          {/* Live Staff & Judge Broadcast Email Directory Card */}
          <div className="bg-white border border-paperDark rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paperDark">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brick/10 text-brick flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-base text-ink flex items-center gap-2">
                    Staff &amp; Judge Broadcast Directory
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </h3>
                  <p className="text-[11px] text-ink/60">
                    {staffList.length} active recipient{staffList.length === 1 ? "" : "s"} will receive real emergency emails via SMTP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchStaffList}
                className="text-xs text-ink/60 hover:text-ink flex items-center gap-1.5 self-start sm:self-auto py-1 px-2.5 rounded-lg hover:bg-paper"
                title="Refresh staff list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStaff ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="bg-paper/50 border border-paperDark rounded-xl p-3 text-xs text-ink/70 leading-relaxed flex items-start gap-2">
              <span className="text-sm">💡</span>
              <div>
                <strong>Live Hackathon Demonstration:</strong> Type a judge&apos;s real email below and click <strong>Add Recipient</strong>. When you click <em>Send Emergency Alert</em>, an authentic email will arrive on their phone. Click the trash icon to remove their email from the database after demonstrating.
              </div>
            </div>

            {staffActionMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{staffActionMsg}</span>
              </div>
            )}

            {/* Add email form */}
            <form onSubmit={handleAddStaff} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter judge or faculty email (e.g. judge@college.edu)"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                required
                className="flex-1 border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
              />
              <button
                type="submit"
                disabled={addingStaff || !newStaffEmail.trim()}
                className="inline-flex items-center justify-center gap-1.5 bg-brick text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                {addingStaff ? "Adding..." : "Add Recipient"}
              </button>
            </form>

            {/* Active recipient badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {staffList.length === 0 ? (
                <span className="text-xs text-ink/40 italic">No custom staff emails added yet.</span>
              ) : (
                staffList.map((email) => (
                  <div
                    key={email}
                    className="inline-flex items-center gap-2 bg-white border border-paperDark px-3 py-1.5 rounded-full text-xs font-medium text-ink shadow-2xs group"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(email)}
                      className="text-ink/40 hover:text-brick transition-colors ml-1 p-0.5 rounded-full hover:bg-paper"
                      title={`Remove ${email} from broadcast`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Protocol & FAQ Panel */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-display text-lg text-ink">Protocol &amp; Dispatch Rules</h3>
              <div className="flex flex-col gap-3 text-xs text-ink/75 leading-relaxed">
                <div className="p-3 bg-paper rounded-xl border border-paperDark">
                  <strong className="text-ink block mb-1">1. Campus-Wide Broadcast</strong>
                  Broadcasts immediately reach available staff and faculty across all departments on campus to ensure fast emergency response.
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