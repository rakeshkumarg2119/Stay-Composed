"use client";

import { useEffect, useState } from "react";
import { getApiClient } from "@/lib/apiClient";
import { LostFoundItem } from "@/types";
import ItemCard from "@/components/ItemCard";

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const api = getApiClient();
      const res = await api.get("/items");
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
      {/* Sidebar — fills the space that used to be empty margin */}
      <aside className="flex flex-col gap-6">
        <div className="tag-card tag-card--found p-5">
          <p className="text-xs uppercase tracking-wide text-sky mb-1">
            Right now
          </p>
          <p className="font-display text-3xl">{items.length}</p>
          <p className="text-sm text-ink/60">items on record</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-purple font-medium">{lostCount} lost</span>
            <span className="text-sky font-medium">{foundCount} found</span>
          </div>
        </div>

        <div className="bg-white border border-paperDark rounded-xl p-5 flex flex-col gap-3">
          <h3 className="font-display text-lg">How it works</h3>
          <ol className="text-sm text-ink/60 flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="text-purple font-medium">1</span>
              Report what you lost or found
            </li>
            <li className="flex gap-3">
              <span className="text-purple font-medium">2</span>
              The system quietly matches reports for you
            </li>
            <li className="flex gap-3">
              <span className="text-purple font-medium">3</span>
              Verify ownership with a secret detail
            </li>
            <li className="flex gap-3">
              <span className="text-purple font-medium">4</span>
              Connect and recover it, privately
            </li>
          </ol>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">Lost &amp; Found</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple text-white px-4 py-2 rounded-full text-sm hover:bg-blue transition-colors"
          >
            {showForm ? "Close" : "Report Item"}
          </button>
        </div>

        {showForm && (
          <ReportItemForm
            onSuccess={() => {
              setShowForm(false);
              fetchItems();
            }}
          />
        )}

        <div className="flex gap-2 text-sm">
          {(["all", "lost", "found"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full border transition-colors ${
                filter === f
                  ? "bg-ink text-white border-ink"
                  : "border-paperDark text-ink/60 hover:border-purple"
              }`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading items...</p>
        ) : filteredItems.length === 0 ? (
          <div className="border border-dashed border-paperDark rounded-2xl py-20 flex flex-col items-center gap-3 text-center bg-white/50">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-lavender"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5v9a2.25 2.25 0 01-2.25 2.25h-13.5A2.25 2.25 0 013 16.5v-9m18 0A2.25 2.25 0 0018.75 5.25H5.25A2.25 2.25 0 003 7.5m18 0l-8.485 5.303a2.25 2.25 0 01-2.03 0L3 7.5"
              />
            </svg>
            <p className="font-display text-lg">Nothing reported yet</p>
            <p className="text-sm text-ink/60 max-w-xs">
              Connect your backend in Settings, or be the first to report a
              lost or found item.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportItemForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const api = getApiClient();
      await api.post("/items", { type, title, description });
      onSuccess();
    } catch {
      alert("Failed to submit. Check your backend connection in Settings.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-paperDark rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex gap-2 text-sm">
        {(["lost", "found"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              type === t
                ? "bg-purple text-white border-purple"
                : "border-paperDark text-ink/60"
            }`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Item title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        rows={3}
        className="border border-paperDark rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-purple text-white px-4 py-2 rounded-full text-sm hover:bg-blue transition-colors disabled:opacity-50 self-start"
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}