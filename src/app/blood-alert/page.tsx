"use client";

import { useState } from "react";
import { getApiClient } from "@/lib/apiClient";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodAlertPage() {
  const [studentName, setStudentName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    try {
      const api = getApiClient();
      await api.post("/blood-alert", {
        studentName,
        bloodType,
        phoneNumber,
        department,
      });
      setStatus("success");
      setStudentName("");
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
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6">
        <div className="tag-card tag-card--lost p-5" style={{ borderColor: "#B8433D" }}>
          <p className="text-xs uppercase tracking-wide text-brick mb-1">
            Why this matters
          </p>
          <p className="text-sm text-ink/60">
            Your request is emailed directly to staff in your department who
            are marked available — no waiting for a moderator.
          </p>
        </div>

        <div className="bg-white border border-paperDark rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-purple mb-3">
            Blood type reference
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {BLOOD_TYPES.map((bt) => (
              <div
                key={bt}
                className="bg-paper border border-paperDark rounded-lg py-2 text-sm font-medium text-ink/70"
              >
                {bt}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main form */}
      <div className="flex flex-col gap-6 max-w-md">
        <div>
          <h1 className="font-display text-2xl">Blood Alert</h1>
          <p className="text-sm text-ink/60 mt-1">
            Submit a request and we'll notify available staff in your
            department by email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-paperDark rounded-xl p-6 flex flex-col gap-3"
        >
          <input
            type="text"
            placeholder="Your name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            className="border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
          />

          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            required
            className="border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white"
          >
            <option value="" disabled>
              Select blood type
            </option>
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>

          <input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
          />

          <input
            type="text"
            placeholder="Department (e.g. CA & IT)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-brick text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Alert"}
          </button>

          {status === "success" && (
            <p className="text-sm text-sky">
              Alert sent. Staff in your department will reach out directly.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-brick">
              Couldn't send the alert. Check your backend connection in
              Settings.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}