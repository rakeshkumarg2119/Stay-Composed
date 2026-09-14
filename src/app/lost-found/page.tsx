"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getApiClient } from "@/lib/apiClient";
import { LostFoundItem } from "@/types";
import ItemCard from "@/components/ItemCard";
import {
  Search,
  Plus,
  Lock,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

export default function LostFoundPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredItems = items
    .filter((i) => (filter === "all" ? true : i.type === filter))
    .filter((i) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        i.title?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
    });

  const lostCount = items.filter((i) => i.type === "lost").length;
  const foundCount = items.filter((i) => i.type === "found").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6">
        <div className="tag-card tag-card--found p-5">
          <p className="text-xs uppercase tracking-wider font-semibold text-sky mb-1">
            Campus Status
          </p>
          <p className="font-display text-3xl">{items.length}</p>
          <p className="text-sm text-ink/60">items on record</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-purple font-medium">{lostCount} lost</span>
            <span className="text-sky font-medium">{foundCount} found</span>
          </div>
        </div>

        {session ? (
          <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div className="text-xs">
                <p className="font-semibold text-ink">{session.user?.name}</p>
                <p className="text-ink/50 text-[11px] truncate max-w-[150px]">{session.user?.email}</p>
              </div>
            </div>
            <Link href="/profile" className="text-xs text-purple font-semibold hover:underline">
              Profile
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple">
              <Lock className="w-3.5 h-3.5" />
              <span>Campus Account Required</span>
            </div>
            <p className="text-xs text-ink/65 leading-relaxed">
              Sign in to report missing items, respond to ownership challenges, and unlock private AI matches.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-1.5 bg-purple text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue transition-colors"
            >
              Sign in to Report
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <h3 className="font-display text-lg">How AI Matching Works</h3>
          <ol className="text-xs text-ink/65 flex flex-col gap-3.5 leading-relaxed">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-purple/10 text-purple font-semibold flex items-center justify-center shrink-0">1</span>
              <span>Report what you lost or found with photos and visual clues</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-sky/10 text-sky font-semibold flex items-center justify-center shrink-0">2</span>
              <span>CLIP AI compares text and image embeddings to rank match confidence</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-blue/10 text-blue font-semibold flex items-center justify-center shrink-0">3</span>
              <span>Verify ownership via hashed multi-field secret challenge</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-brick/10 text-brick font-semibold flex items-center justify-center shrink-0">4</span>
              <span>Exchange at campus safe spot; structured chat auto-closes</span>
            </li>
          </ol>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Lost &amp; Found</h1>
            <p className="text-sm text-ink/60 mt-1">
              Private, system-matched lost and found directory.
            </p>
          </div>

          {session ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 bg-purple text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue transition-colors shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              {showForm ? "Cancel / Close" : "Report Item"}
            </button>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 bg-purple text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue transition-colors shadow-xs self-start sm:self-auto"
            >
              <Lock className="w-4 h-4" />
              Sign in to Report
            </Link>
          )}
        </div>

        {/* Report form */}
        {showForm && session && (
          <ReportItemForm
            onSuccess={() => {
              setShowForm(false);
              fetchItems();
            }}
          />
        )}

        {/* Filters and search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-paperDark rounded-2xl p-3 shadow-xs">
          <div className="flex gap-2 text-sm">
            {(["all", "lost", "found"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filter === f
                    ? "bg-ink text-white border-ink shadow-xs"
                    : "border-paperDark text-ink/65 hover:border-purple"
                }`}
              >
                {f === "all" ? "All Items" : f === "lost" ? "Lost Items" : "Found Items"}
              </button>
            ))}
          </div>

          <div className="relative flex items-center sm:max-w-xs w-full">
            <Search className="w-4 h-4 text-ink/40 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-paper border border-paperDark rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-lavender"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-ink/50">Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="border border-dashed border-paperDark rounded-2xl py-20 flex flex-col items-center gap-3 text-center bg-white/50">
            <div className="w-12 h-12 rounded-full bg-paperDark flex items-center justify-center text-lavender">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="font-display text-lg">No items matching criteria</p>
            <p className="text-sm text-ink/60 max-w-xs">
              {items.length === 0
                ? "No items have been reported yet. Sign in and be the first to log a report."
                : "Try adjusting your search query or filter selection."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 min-[1600px]:grid-cols-5 gap-5">
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