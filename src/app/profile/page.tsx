"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApiClient } from "@/lib/apiClient";
import { TrueOwnerItem } from "@/types";
import { Droplet, Tag, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface BloodAlertRecord {
  id: string;
  studentName: string;
  bloodType: string;
  phoneNumber: string;
  senderEmail: string;
  recipientsNotified: number;
  createdAt: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [complaints, setComplaints] = useState<TrueOwnerItem[]>([]);
  const [foundItems, setFoundItems] = useState<TrueOwnerItem[]>([]);
  const [bloodAlerts, setBloodAlerts] = useState<BloodAlertRecord[]>([]);

  useEffect(() => {
    if (session?.user?.email) {
      loadUserData(session.user.email);
    }
  }, [session]);

  async function loadUserData(email: string) {
    setLoadingRecords(true);
    try {
      const api = getApiClient();
      const [itemsRes, bloodRes] = await Promise.allSettled([
        api.get("/items/mine", { params: { email } }),
        api.get("/blood-alert/mine", { params: { email } }),
      ]);

      if (itemsRes.status === "fulfilled" && itemsRes.value.data) {
        setComplaints(itemsRes.value.data.myComplaints || []);
        setFoundItems(itemsRes.value.data.myFoundItems || []);
      }
      if (bloodRes.status === "fulfilled" && Array.isArray(bloodRes.value.data)) {
        setBloodAlerts(bloodRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load profile records:", err);
    } finally {
      setLoadingRecords(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-ink/50">Loading profile...</p>;
  }

  if (!session) {
    redirect("/signin");
  }

  const allItems = [
    ...complaints.map((c) => ({ ...c, kind: "Lost Complaint" as const })),
    ...foundItems.map((f) => ({ ...f, kind: "Found Report" as const })),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
      {/* Profile summary */}
      <aside className="flex flex-col gap-6 order-2 lg:order-1">
        <div className="bg-white border border-paperDark rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col items-center text-center gap-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Profile"}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-paperDark shadow-xs object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple text-white flex items-center justify-center text-xl sm:text-2xl font-medium shadow-xs">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
          <div>
            <p className="font-display text-lg sm:text-xl text-ink">{session?.user?.name}</p>
            <p className="text-xs text-ink/50 mt-0.5">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-xs text-brick hover:underline font-medium mt-1"
          >
            Sign out of account
          </button>
        </div>

        <div className="tag-card tag-card--found p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-sky mb-1">
            Account Status
          </p>
          <p className="text-sm text-ink/75 font-medium">Verified Campus Member</p>
          <p className="text-xs text-ink/55 mt-1 leading-relaxed">
            Authenticated via {session?.user?.email?.endsWith("@tcarts.in") ? "TC Arts College Account" : "Campus OAuth"}.
          </p>
        </div>
      </aside>

      {/* Main content — Responsive Grid */}
      <div className="flex flex-col gap-6 order-1 lg:order-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-ink">Your Campus Activity</h1>
            <p className="text-xs sm:text-sm text-ink/65 mt-1 leading-relaxed">
              Live records of your active lost-and-found reports and emergency blood broadcasts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Lost & Found Reports */}
          <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">My Lost &amp; Found Reports</h2>
              <span className="text-xs bg-paper px-2.5 py-1 rounded-full text-ink/60 font-medium">
                {allItems.length} Total
              </span>
            </div>

            {loadingRecords ? (
              <p className="text-xs text-ink/50 py-8 text-center">Loading reports...</p>
            ) : allItems.length === 0 ? (
              <div className="border border-dashed border-paperDark rounded-xl py-10 flex flex-col items-center gap-2 text-center bg-paper/30">
                <p className="text-xs text-ink/60 max-w-xs">
                  No lost or found reports logged under this account yet.
                </p>
                <Link
                  href="/true-owner"
                  className="mt-2 text-xs font-semibold text-purple hover:text-blue flex items-center gap-1"
                >
                  Go to True Owner <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                {allItems.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="border border-paperDark rounded-xl p-3.5 bg-paper/20 flex flex-col gap-2 hover:border-lavender transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          item.kind === "Lost Complaint"
                            ? "bg-purple/10 text-purple"
                            : "bg-sky/10 text-sky"
                        }`}
                      >
                        {item.kind}
                      </span>
                      <span className="text-[11px] text-ink/50">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <h4 className="font-display text-sm text-ink">{item.title}</h4>

                    <div className="flex items-center gap-3 text-[11px] text-ink/60">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple" />
                        {item.category || "General"}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple" />
                          {item.location}
                        </span>
                      )}
                      <span className="ml-auto font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-paperDark">
                        {item.status || "open"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blood Alert Requests */}
          <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">My Blood Alert Broadcasts</h2>
              <span className="text-xs bg-paper px-2.5 py-1 rounded-full text-ink/60 font-medium">
                {bloodAlerts.length} Broadcasts
              </span>
            </div>

            {loadingRecords ? (
              <p className="text-xs text-ink/50 py-8 text-center">Loading broadcasts...</p>
            ) : bloodAlerts.length === 0 ? (
              <div className="border border-dashed border-paperDark rounded-xl py-10 flex flex-col items-center gap-2 text-center bg-paper/30">
                <p className="text-xs text-ink/60 max-w-xs">
                  No emergency blood broadcasts dispatched under this account yet.
                </p>
                <Link
                  href="/blood-alert"
                  className="mt-2 text-xs font-semibold text-brick hover:underline flex items-center gap-1"
                >
                  Broadcast Blood Alert <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
                {bloodAlerts.map((b) => (
                  <div
                    key={b.id}
                    className="border border-paperDark rounded-xl p-3.5 bg-paper/20 flex flex-col gap-2 hover:border-brick/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brick bg-brick/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-brick" />
                        Blood Type: {b.bloodType}
                      </span>
                      <span className="text-[11px] text-ink/50">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>

                    <p className="text-xs text-ink/80 font-medium">
                      Patient / Student: <span className="text-ink font-semibold">{b.studentName}</span>
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-ink/60 pt-1 border-t border-paperDark">
                      <span>Contact: {b.phoneNumber}</span>
                      <span className="text-emerald-700 font-medium">
                        ✓ Dispatched to {b.recipientsNotified} member(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}