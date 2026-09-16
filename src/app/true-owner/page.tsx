"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getApiClient } from "@/lib/apiClient";
import ChatPanel from "@/components/ChatPanel";
import { fetchMyThreads } from "@/lib/chatClient";
import { useNotifications } from "@/context/NotificationContext";
import { ChatThread, ClaimResult, TrueOwnerItem } from "@/types";
import {
  ShieldCheck,
  Search,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  MapPin,
  Tag,
  ArrowRight,
  ImageIcon,
  X,
  RotateCcw,
} from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "ID & Cards",
  "Keys",
  "Wallet / Purse",
  "Bags & Backpacks",
  "Watches & Jewelry",
  "Books & Stationery",
  "Clothing & Accessories",
  "Other",
];

// Keep in sync with backend/app/utils/locations.py -> CAMPUS_LOCATIONS
const LOCATIONS = [
  "New Block (NB)",
  "Physics UG & PG Block",
  "Chemistry UG & PG Block",
  "Rahda Thiagarajar Auditorium (RTA)",
  "Zoology Block (NH)",
  "Biotechnology Block",
  "Library Block",
  "TK Block",
  "Others",
];
const OTHERS_LOCATION = "Others";
// Keep in sync with backend/app/config.py -> chat_min_confidence
const CHAT_MIN_CONFIDENCE = 50;

export default function TrueOwnerPage() {
  const { data: session } = useSession();
  const { triggerMatchCheck } = useNotifications();

  const [myComplaints, setMyComplaints] = useState<TrueOwnerItem[]>([]);
  const [myFoundItems, setMyFoundItems] = useState<TrueOwnerItem[]>([]);
  const [candidateMatches, setCandidateMatches] = useState<
    { candidate: TrueOwnerItem; forComplaintId: string; confidence: number }[]
  >([]);
  const [chatConfidenceThreshold, setChatConfidenceThreshold] = useState(50);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"complaints" | "matches" | "my-found">("complaints");
  const [backendError, setBackendError] = useState(false);

  // Form modal and Calm Notice state
  const [formType, setFormType] = useState<"lost" | "found" | null>(null);
  const [calmNotice, setCalmNotice] = useState<{ type: "lost" | "found"; title: string } | null>(null);
  const [resettingDemo, setResettingDemo] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "matches" || tabParam === "my-found" || tabParam === "complaints") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchTrueOwnerData();
    } else {
      setLoading(false);
    }
  }, [session]);

  async function fetchTrueOwnerData() {
    if (!session?.user?.email) return;
    setLoading(true);
    setBackendError(false);
    try {
      const api = getApiClient();
      const res = await api.get("/items/mine", { params: { email: session.user.email } });
      setMyComplaints(res.data?.myComplaints || []);
      setMyFoundItems(res.data?.myFoundItems || []);
      setCandidateMatches(res.data?.candidateMatches || []);
      if (res.data?.chatConfidenceThreshold) {
        setChatConfidenceThreshold(res.data.chatConfidenceThreshold);
      }
    } catch (err) {
      console.error("Failed to load True Owner data from backend:", err);
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetDemoData() {
    if (
      !window.confirm(
        "Clean all demo items, candidate matches, and chat history for presentation test accounts (24suca17@tcarts.in & 24suca111@tcarts.in)?"
      )
    ) {
      return;
    }
    setResettingDemo(true);
    setResetStatus(null);
    try {
      const api = getApiClient();
      const res = await api.delete("/items/demo-reset");
      setResetStatus(
        `Demo data reset: cleaned ${res.data?.deletedItems || 0} items & ${res.data?.deletedThreads || 0} chat threads.`
      );
      await fetchTrueOwnerData();
      triggerMatchCheck();
      setTimeout(() => setResetStatus(null), 5000);
    } catch (err) {
      console.error("Failed to reset demo data:", err);
      alert("Failed to reset demo data. Please verify your backend server.");
    } finally {
      setResettingDemo(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner & Heading */}
      <div className="hero-gradient border border-paperDark rounded-3xl p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-paperDark px-3 py-1 rounded-full text-xs font-semibold text-purple mb-4 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-purple" />
            True Owner &bull; AI-Verified Ownership
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-ink mb-3">
            True Owner
          </h1>
          <p className="text-sm sm:text-base text-ink/75 leading-relaxed">
            Found items are kept strictly unlisted and hidden from public view to prevent fake claims.
            File a lost item complaint with your product&apos;s secret features to uncover matching items.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {session ? (
            <>
              <button
                onClick={() => setFormType("lost")}
                className="inline-flex items-center justify-center gap-2 bg-purple text-white px-5 py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                File Lost Complaint
              </button>
              <button
                onClick={() => setFormType("found")}
                className="inline-flex items-center justify-center gap-2 bg-white text-ink border border-paperDark px-5 py-3 rounded-full text-xs sm:text-sm font-semibold hover:border-sky hover:text-sky transition-all shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Report Found Item
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={resettingDemo}
                className="inline-flex items-center justify-center gap-2 bg-paper text-ink/75 border border-paperDark px-4 py-3 rounded-full text-xs sm:text-sm font-semibold hover:border-brick hover:text-brick transition-all shadow-xs disabled:opacity-50"
                title="Wipe demo items & chats for 24suca17@tcarts.in & 24suca111@tcarts.in between presentations"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-purple ${resettingDemo ? "animate-spin" : ""}`} />
                {resettingDemo ? "Resetting..." : "Reset Demo Data"}
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center justify-center gap-2 bg-purple text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-blue transition-all shadow-xs"
            >
              <Lock className="w-4 h-4" />
              Sign in with Campus Account
            </Link>
          )}
        </div>
      </div>

      {resetStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetStatus}</span>
        </div>
      )}

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
        {/* Sidebar */}
        <aside className="flex flex-col gap-6 order-2 lg:order-1">
          <div className="tag-card tag-card--found p-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-sky mb-1">
              Your True Owner Activity
            </p>
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex justify-between items-center text-sm border-b border-paperDark pb-2">
                <span className="text-ink/70">Complaints Filed:</span>
                <span className="font-display font-semibold text-purple text-base">
                  {myComplaints.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-paperDark pb-2">
                <span className="text-ink/70">AI Candidate Matches:</span>
                <span className="font-display font-semibold text-sky text-base">
                  {candidateMatches.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink/70">Items Found by You:</span>
                <span className="font-display font-semibold text-ink text-base">
                  {myFoundItems.length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <h3 className="font-display text-base text-ink">Core Privacy Rules</h3>
            <div className="flex flex-col gap-3 text-xs text-ink/70 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-purple shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block">Zero Public Browsing</strong>
                  Found items are hidden from general view. They only surface when a matching lost complaint is registered.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block">Secret Verification Features</strong>
                  Secret traits entered by the owner are kept secret and never published, ensuring genuine proof.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ImageIcon className="w-4 h-4 text-brick shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block">Founder Photo Enforcement</strong>
                  Found items must have a photo stored on Cloudinary for verified visual match scoring.
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col gap-6 order-1 lg:order-2">
          {!session ? (
            <div className="bg-white border border-paperDark rounded-3xl p-6 sm:p-10 lg:p-14 text-center flex flex-col items-center gap-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-purple/10 text-purple flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl text-ink">Sign in to Access True Owner</h2>
              <p className="text-sm text-ink/65 max-w-md leading-relaxed">
                Found items are not accessible by public search. Sign in with your campus Google account
                to file a complaint for your lost product or report a found item.
              </p>
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 bg-purple text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue transition-colors shadow-xs mt-2"
              >
                Sign in with Google / Campus Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {backendError && (
                <div className="bg-brick/10 border border-brick/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-brick leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Couldn&apos;t reach the FastAPI backend for CLIP matching. Connect your
                      ngrok URL in Settings, then refresh this page.
                    </span>
                  </div>
                  <Link
                    href="/settings"
                    className="shrink-0 inline-flex items-center gap-1.5 bg-brick text-white px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Go to Settings
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Navigation Tabs - Horizontally scrollable on mobile */}
              <div className="border-b border-paperDark pb-3 -mx-2 px-2 overflow-x-auto scrollbar-none">
                <div className="flex gap-2 min-w-max pb-1">
                  <button
                    onClick={() => setActiveTab("complaints")}
                    className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === "complaints"
                        ? "bg-purple text-white shadow-xs"
                        : "bg-white text-ink/70 border border-paperDark hover:border-purple"
                    }`}
                  >
                    My Filed Complaints ({myComplaints.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("matches")}
                    className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === "matches"
                        ? "bg-sky text-white shadow-xs"
                        : "bg-white text-ink/70 border border-paperDark hover:border-sky"
                    }`}
                  >
                    AI Candidate Matches ({candidateMatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("my-found")}
                    className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === "my-found"
                        ? "bg-ink text-white shadow-xs"
                        : "bg-white text-ink/70 border border-paperDark hover:border-ink"
                    }`}
                  >
                    Items I Found ({myFoundItems.length})
                  </button>
                </div>
              </div>

              {/* Tab 1: My Complaints */}
              {activeTab === "complaints" && (
                <div className="flex flex-col gap-6">
                  {loading ? (
                    <div className="py-16 text-center text-sm text-ink/50">Loading complaints...</div>
                  ) : myComplaints.length === 0 ? (
                    <div className="border border-dashed border-paperDark rounded-3xl p-10 sm:p-14 text-center bg-white/70 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-paperDark flex items-center justify-center text-purple">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="font-display text-xl text-ink">No Complaints Filed Yet</h3>
                      <p className="text-xs sm:text-sm text-ink/65 max-w-md leading-relaxed">
                        Remember: found items are <strong>never shown publicly</strong> unless a complaint is filed.
                        If you lost a product, file a complaint detailing its secret features so the AI can match it.
                      </p>
                      <button
                        onClick={() => setFormType("lost")}
                        className="inline-flex items-center gap-2 bg-purple text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue transition-colors shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        File Lost Complaint Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {myComplaints.map((complaint) => {
                        // Find candidate matches for this complaint
                        const matchesForThis = candidateMatches.filter(
                          (m) => m.forComplaintId === (complaint._id || complaint.id)
                        );
                        return (
                          <ComplaintCard
                            key={complaint._id || complaint.id}
                            complaint={complaint}
                            matches={matchesForThis}
                            claimantEmail={session?.user?.email || ""}
                            chatConfidenceThreshold={chatConfidenceThreshold}
                            onClaimed={fetchTrueOwnerData}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Candidate Matches */}
              {activeTab === "matches" && (
                <div className="flex flex-col gap-6">
                  {candidateMatches.length === 0 ? (
                    <div className="border border-dashed border-paperDark rounded-3xl p-10 sm:p-14 text-center bg-white/70 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-paperDark flex items-center justify-center text-sky">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="font-display text-xl text-ink">No Candidate Matches Detected Yet</h3>
                      <p className="text-xs sm:text-sm text-ink/65 max-w-md leading-relaxed">
                        {myComplaints.length === 0
                          ? "You have not filed any lost item complaints yet. File a complaint to let the AI search candidate found reports."
                          : "Our matching engine is actively scanning. As soon as a finder registers an item matching your product description, it will surface here."}
                      </p>
                      {myComplaints.length === 0 && (
                        <button
                          onClick={() => setFormType("lost")}
                          className="bg-purple text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors shadow-xs"
                        >
                          File Lost Complaint
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {candidateMatches.map(({ candidate, confidence, forComplaintId }) => (
                        <CandidateMatchCard
                          key={candidate._id || candidate.id}
                          candidate={candidate}
                          confidence={confidence}
                          forComplaintId={forComplaintId}
                          claimantEmail={session?.user?.email || ""}
                          chatConfidenceThreshold={chatConfidenceThreshold}
                          onClaimed={fetchTrueOwnerData}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Items I Found */}
              {activeTab === "my-found" && (
                <div className="flex flex-col gap-6">
                  {myFoundItems.length === 0 ? (
                    <div className="border border-dashed border-paperDark rounded-3xl p-10 sm:p-14 text-center bg-white/70 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-paperDark flex items-center justify-center text-brick">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h3 className="font-display text-xl text-ink">No Items Logged as Found</h3>
                      <p className="text-xs sm:text-sm text-ink/65 max-w-md leading-relaxed">
                        Found someone&apos;s lost belongings on campus? Register the item with a compulsory photo.
                        It will remain safely unlisted until the true owner proves their claim.
                      </p>
                      <button
                        onClick={() => setFormType("found")}
                        className="bg-sky text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors shadow-xs"
                      >
                        Report a Found Item
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {myFoundItems.map((item) => (
                        <FoundItemCard
                          key={item._id || item.id}
                          item={item}
                          founderEmail={session?.user?.email || ""}
                          chatConfidenceThreshold={chatConfidenceThreshold}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal: File Lost Complaint or Report Found Item */}
      {formType && (
        <ItemFormModal
          type={formType}
          onClose={() => setFormType(null)}
          onSuccess={(data) => {
            setFormType(null);
            setCalmNotice(data);
            fetchTrueOwnerData();
            triggerMatchCheck();
          }}
        />
      )}

      {/* Reassuring Calm Confirmation Modal */}
      {calmNotice && (
        <CalmNoticeModal
          type={calmNotice.type}
          title={calmNotice.title}
          onClose={() => setCalmNotice(null)}
        />
      )}
    </div>
  );
}

// =========================================================================
// Component: Calm Notice Modal (Reassures user after filing lost/found item)
// =========================================================================
function CalmNoticeModal({
  type,
  title,
  onClose,
}: {
  type: "lost" | "found";
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-70 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-paperDark rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
            type === "lost"
              ? "bg-purple/10 text-purple border border-purple/20"
              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
          }`}
        >
          {type === "lost" ? (
            <Sparkles className="w-7 h-7" />
          ) : (
            <ShieldCheck className="w-7 h-7" />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full self-center ${
              type === "lost"
                ? "bg-purple/10 text-purple"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {type === "lost"
              ? "Report Registered • Stay Composed"
              : "Honesty Acknowledged • Stay Composed"}
          </span>
          <h3 className="font-display text-2xl text-ink">
            {type === "lost"
              ? "Stay Composed — We've Got You Covered"
              : "Thank You for Your Integrity"}
          </h3>
        </div>

        <div className="bg-paper/60 border border-paperDark rounded-2xl p-4 text-xs sm:text-sm text-ink/75 leading-relaxed text-left flex flex-col gap-2.5 w-full">
          {type === "lost" ? (
            <>
              <p>
                Take a deep breath! Your lost report for{" "}
                <strong>&ldquo;{title}&rdquo;</strong> has been logged into the secure campus database.
              </p>
              <div className="flex items-start gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-purple shrink-0 mt-0.5" />
                <span>
                  <strong>Completely Confidential:</strong> Your secret verification features are encrypted and never shown publicly.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>24/7 AI Scanning:</strong> Our model actively compares your report against all found items registered on campus.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Instant Notification &amp; Email:</strong> The second a match is discovered, you will receive an in-app alert and an email will be sent to your registered college email.
                </span>
              </div>
            </>
          ) : (
            <>
              <p>
                Stay composed! You have performed an honorable act for our campus community by registering{" "}
                <strong>&ldquo;{title}&rdquo;</strong>.
              </p>
              <div className="flex items-start gap-2 text-xs">
                <Lock className="w-4 h-4 text-purple shrink-0 mt-0.5" />
                <span>
                  <strong>Protected from Fake Claims:</strong> This item is kept unlisted from public browsing to prevent opportunistic claiming.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Automated Pairing:</strong> Only an owner whose authentic lost report matches this item will be surfaced.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Notification &amp; Challenge:</strong> You will be alerted via notification and email as soon as a match is established. You can test them with your challenge questions before meeting!
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple hover:bg-blue text-white py-3 rounded-full font-semibold text-sm transition-all shadow-xs hover:shadow-sm active:scale-[0.99] mt-2"
        >
          OK, Understood
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// Component: Image Viewer Modal (Full high-resolution inspection)
// =========================================================================
function ImageViewerModal({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 cursor-zoom-out"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-ink/90 border border-white/15 rounded-2xl sm:rounded-3xl p-3 flex flex-col items-center shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-2 mb-2 text-white/90 border-b border-white/10">
          <span className="text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky" /> High-Resolution Photo Inspection
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-1 sm:p-3 flex items-center justify-center max-h-[80vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Full Photo"
            className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg select-none"
          />
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// Component: Complaint Card (Shows user's lost complaint & secret features)
// =========================================================================
function ComplaintCard({
  complaint,
  matches,
  claimantEmail,
  chatConfidenceThreshold = 50,
  onClaimed,
}: {
  complaint: TrueOwnerItem;
  matches: { candidate: TrueOwnerItem; confidence: number }[];
  claimantEmail: string;
  chatConfidenceThreshold?: number;
  onClaimed: () => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [claiming, setClaiming] = useState<TrueOwnerItem | null>(null);
  const [chattingWith, setChattingWith] = useState<TrueOwnerItem | null>(null);
  const [chattingThread, setChattingThread] = useState<ChatThread | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const complaintId = complaint._id || complaint.id || "";

  useEffect(() => {
    if (!claimantEmail || !complaintId) return;
    let cancelled = false;
    fetchMyThreads(claimantEmail)
      .then((all) => {
        if (!cancelled) setThreads(all.filter((t) => t.complaintId === complaintId));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [claimantEmail, complaintId]);

  return (
    <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paperDark pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-purple bg-purple/10 px-2.5 py-0.5 rounded-md">
              Lost Complaint
            </span>
            {complaint.status === "resolved" ? (
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved &amp; Handed Over
              </span>
            ) : complaint.status === "verified" ? (
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Ownership Verified &bull; Pending Handover
              </span>
            ) : (
              <span className="text-xs uppercase tracking-wider font-bold text-sky bg-sky/10 px-2.5 py-0.5 rounded-md">
                Status: Open
              </span>
            )}
            <span className="text-xs text-ink/50">
              Filed on {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-display text-xl text-ink">{complaint.title}</h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink/65">
          <span className="flex items-center gap-1 bg-paper px-3 py-1 rounded-full border border-paperDark">
            <Tag className="w-3.5 h-3.5 text-purple" />
            {complaint.category || "General"}
          </span>
          <span className="flex items-center gap-1 bg-paper px-3 py-1 rounded-full border border-paperDark">
            <MapPin className="w-3.5 h-3.5 text-purple" />
            {complaint.location || "Campus"}
          </span>
        </div>
      </div>

      {/* Handover completion banner */}
      {complaint.status === "resolved" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Case Resolved &bull; Item Handed Over</p>
            <p className="text-emerald-700/80 text-[11px] mt-0.5">
              This lost item was successfully verified and returned. Handover is complete!
            </p>
          </div>
        </div>
      )}

      {/* General Description */}
      <div className="text-xs sm:text-sm text-ink/75 leading-relaxed">
        <strong className="text-ink block mb-1">General Description:</strong>
        {complaint.description}
      </div>

      {/* Secret Verification Features */}
      <div className="bg-purple/5 border border-purple/20 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Secret Verification Feature (Hidden from Public &amp; Finders)
          </span>
          <button
            onClick={() => setShowSecret(!showSecret)}
            className="text-xs text-purple font-medium hover:underline flex items-center gap-1"
          >
            {showSecret ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Show Secret
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-ink/80 bg-white/80 p-3 rounded-lg border border-purple/10 font-mono">
          {showSecret ? (
            complaint.secretFeatures && complaint.secretFeatures.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {complaint.secretFeatures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              "No secret specified"
            )
          ) : (
            <span className="text-ink/40 tracking-widest">
              &bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull; (Kept Private for Verification)
            </span>
          )}
        </div>
        <p className="text-[11px] text-ink/50">
          Only you can see this. When an item is found, the system challenges the candidate with this secret.
        </p>
      </div>

      {/* Active Finder Chat & Handover Threads for this complaint */}
      {threads.length > 0 && (
        <div className="pt-2 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-purple flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Active Finder Chat &amp; Handover ({threads.length})
          </span>
          {threads.map((t) => (
            <div
              key={t.threadId}
              className="flex items-center justify-between bg-paper hover:bg-paperDark/50 transition-colors rounded-xl px-4 py-3 border border-paperDark"
            >
              <div>
                <span className="text-xs font-semibold text-ink/85 block">
                  {t.status === "handed_over" || t.status === "resolved"
                    ? "🤝 Handover complete & closed (Resolved)"
                    : t.status === "verified"
                    ? "✅ Ownership verified — chat open to coordinate handover"
                    : t.status === "verifying"
                    ? "🔒 Verification in progress — answer challenge"
                    : "💬 Chat active with Finder"}
                </span>
                <span className="text-[10px] text-ink/50">AI Match Confidence: {t.confidence}%</span>
              </div>
              <button
                onClick={() => setChattingThread(t)}
                className="bg-purple text-white px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors shadow-xs"
              >
                {t.status === "handed_over" || t.status === "resolved" ? "View Closed Chat" : "Open Chat with Finder"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Matches for this complaint */}
      {complaint.status !== "resolved" && (
        <div className="mt-2 pt-4 border-t border-paperDark flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm text-ink flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky" />
              Matching Candidate Found Items ({matches.length})
            </h4>
            <span className="text-xs text-ink/50">Found items only surface when matching</span>
          </div>

          {matches.length === 0 ? (
            <div className="bg-paper rounded-xl p-4 text-xs text-ink/60 flex items-center gap-2">
              <Clock className="w-4 h-4 text-ink/40" />
              <span>
                Searching campus found registry... No candidate matches found yet.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches.map(({ candidate, confidence }) => (
                <div
                  key={candidate._id || candidate.id}
                  className="bg-paper border border-paperDark rounded-xl p-4 flex flex-col gap-3"
                >
                  {candidate.imageUrl && (
                    <div
                      className="relative rounded-lg overflow-hidden border border-paperDark cursor-pointer group bg-black/5"
                      onClick={() => setViewingImage(candidate.imageUrl || null)}
                      title="Click to view full image"
                    >
                      <img
                        src={candidate.imageUrl}
                        alt={candidate.title}
                        className="w-full h-36 object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1 backdrop-blur-2xs">
                        <Eye className="w-3.5 h-3.5" /> Full Photo
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-sky">
                        {confidence}% AI Confidence
                      </span>
                      <span className="text-[11px] text-ink/50">
                        Found at {candidate.location}
                      </span>
                    </div>
                    <h5 className="font-display text-sm text-ink">{candidate.title}</h5>
                    <p className="text-xs text-ink/65 line-clamp-2 mt-1">
                      {candidate.description}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      confidence >= chatConfidenceThreshold ? setChattingWith(candidate) : setClaiming(candidate)
                    }
                    className="bg-purple text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors self-start shadow-xs"
                  >
                    {confidence >= chatConfidenceThreshold ? "Open Chat with Finder" : "Verify Ownership (Answer Challenge)"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {claiming && (
        <ClaimModal
          complaintId={complaintId}
          found={claiming}
          claimantEmail={claimantEmail}
          onClose={() => setClaiming(null)}
          onVerified={() => {
            setClaiming(null);
            onClaimed();
          }}
        />
      )}

      {chattingWith && (
        <ChatPanel
          complaintId={complaintId}
          foundItemId={chattingWith._id || chattingWith.id || ""}
          currentEmail={claimantEmail}
          isFounder={false}
          itemTitle={chattingWith.title}
          onClose={() => setChattingWith(null)}
          onVerificationUnlocked={() => {
            setClaiming(chattingWith);
            // Chat remains open behind modal
          }}
        />
      )}

      {chattingThread && (
        <ChatPanel
          complaintId={chattingThread.complaintId}
          foundItemId={chattingThread.foundItemId}
          currentEmail={claimantEmail}
          isFounder={false}
          itemTitle={complaint.title}
          onClose={() => setChattingThread(null)}
          onVerificationUnlocked={() => {
            const match = matches.find((m) => (m.candidate._id || m.candidate.id) === chattingThread.foundItemId);
            if (match) {
              setClaiming(match.candidate);
            }
          }}
        />
      )}

      {viewingImage && (
        <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}
    </div>
  );
}

// =========================================================================
// Component: Candidate Match Card (In Tab 2)
// =========================================================================
function CandidateMatchCard({
  candidate,
  confidence,
  forComplaintId,
  claimantEmail,
  chatConfidenceThreshold = 50,
  onClaimed,
}: {
  candidate: TrueOwnerItem;
  confidence: number;
  forComplaintId: string;
  claimantEmail: string;
  chatConfidenceThreshold?: number;
  onClaimed: () => void;
}) {
  const [claiming, setClaiming] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  return (
    <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {candidate.imageUrl && (
          <div
            className="relative rounded-xl overflow-hidden border border-paperDark cursor-pointer group bg-black/5"
            onClick={() => setViewingImage(candidate.imageUrl || null)}
            title="Click to view full image"
          >
            <img
              src={candidate.imageUrl}
              alt={candidate.title}
              className="w-full h-48 object-contain rounded-xl transition-transform group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-2xs">
              <Eye className="w-4 h-4" /> Click to view full image
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold bg-sky/10 text-sky px-2.5 py-1 rounded-md">
            {confidence}% AI Match Confidence
          </span>
          <span className="text-xs text-ink/50">{candidate.location}</span>
        </div>
        <h3 className="font-display text-lg text-ink">{candidate.title}</h3>
        <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
          {candidate.description}
        </p>
      </div>

      <div className="pt-3 border-t border-paperDark flex items-center justify-between">
        <span className="text-xs text-ink/50">Reported by {candidate.reportedBy}</span>
        <button
          onClick={() => (confidence >= chatConfidenceThreshold ? setChatting(true) : setClaiming(true))}
          className="bg-purple text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue transition-colors shadow-xs"
        >
          {confidence >= chatConfidenceThreshold ? "Open Chat with Finder" : "Claim This Match"}
        </button>
      </div>

      {claiming && (
        <ClaimModal
          complaintId={forComplaintId}
          found={candidate}
          claimantEmail={claimantEmail}
          onClose={() => setClaiming(false)}
          onVerified={() => {
            setClaiming(false);
            onClaimed();
          }}
        />
      )}

      {chatting && (
        <ChatPanel
          complaintId={forComplaintId}
          foundItemId={candidate._id || candidate.id || ""}
          currentEmail={claimantEmail}
          isFounder={false}
          itemTitle={candidate.title}
          onClose={() => setChatting(false)}
          onVerificationUnlocked={() => {
            setClaiming(true);
            // Chat remains open behind modal
          }}
        />
      )}

      {viewingImage && (
        <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}
    </div>
  );
}

// =========================================================================
// Component: Claim Modal — answers the finder's challenge question(s).
// Backend hashes + majority-matches these against the finder's secret
// answers; a single lucky guess can't fake ownership.
// =========================================================================
function ClaimModal({
  complaintId,
  found,
  claimantEmail,
  onClose,
  onVerified,
}: {
  complaintId: string;
  found: TrueOwnerItem;
  claimantEmail: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const questions = found.challengeQuestions && found.challengeQuestions.length > 0
    ? found.challengeQuestions
    : ["Describe the identifying secret detail on this item."];
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      const api = getApiClient();
      const res = await api.post("/claims", {
        complaintId,
        foundItemId: found._id || found.id,
        answers,
        claimantEmail,
      });
      setResult(res.data as ClaimResult);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail || "Couldn't reach the verification backend. Check Settings and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-paperDark rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-paperDark mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-purple bg-purple/10 px-2 py-0.5 rounded-md">
              Ownership Verification
            </span>
            <h2 className="font-display text-lg text-ink mt-1">Answer the Secret Challenge</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 shrink-0 rounded-full bg-paper flex items-center justify-center text-ink/60 hover:text-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Found Product Image preview with full-size inspection */}
        {found.imageUrl && (
          <div
            className="relative rounded-xl overflow-hidden border border-paperDark bg-black/5 cursor-pointer group mb-3"
            onClick={() => setViewingImage(found.imageUrl || null)}
            title="Click to view full image"
          >
            <img
              src={found.imageUrl}
              alt={found.title}
              className="w-full max-h-48 object-contain rounded-xl p-1 bg-white/50 transition-transform group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-2xs">
              <Eye className="w-4 h-4" /> Click to inspect full image
            </div>
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
              <Eye className="w-3 h-3" /> Inspect Photo
            </span>
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-xs text-ink/65 leading-relaxed">
              Only the true owner can answer these correctly. A majority of your answers must match
              the finder&apos;s hidden secret details. <strong>AI semantic matching is active</strong> &mdash; so correct answers in different phrasing won&apos;t lock you out.
            </p>
            {questions.map((q, i) => (
              <div key={i}>
                <label className="text-xs font-semibold text-ink/75 block mb-1">
                  {i + 1}. {q}
                </label>
                <input
                  type="text"
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  required
                  className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
                />
              </div>
            ))}

            {errorMsg && (
              <div className="bg-brick/10 border border-brick/30 rounded-xl p-2.5 text-xs text-brick flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-paperDark mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-ink/70 hover:bg-paper"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple text-white px-5 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue transition-colors disabled:opacity-50 shadow-xs"
              >
                {submitting ? "Verifying with AI..." : "Submit Answers"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              className={`rounded-xl p-4 flex items-start gap-3 ${
                result.verified ? "bg-emerald-50 border border-emerald-200" : "bg-brick/10 border border-brick/30"
              }`}
            >
              {result.verified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-brick shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                <p className={`font-semibold mb-1 ${result.verified ? "text-emerald-800" : "text-brick"}`}>
                  {result.verified ? "Ownership verified!" : "Verification failed"}
                </p>
                <p className={result.verified ? "text-emerald-800/80" : "text-brick/80"}>{result.message}</p>
                <p className="mt-1 text-ink/50">
                  {result.matchedFields} of {result.totalFields} secret detail(s) matched.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {!result.verified && (
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-ink/70 hover:bg-paper"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={result.verified ? onVerified : onClose}
                className="bg-purple text-white px-5 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue transition-colors shadow-xs"
              >
                {result.verified ? "Done" : "Close"}
              </button>
            </div>
          </div>
        )}

        {viewingImage && (
          <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
        )}
      </div>
    </div>
  );
}

// =========================================================================
// Component: Found Item Card (In Tab 3) — also surfaces any chat a claimant
// opened on this item (only possible once they hit the 85%+ AI match gate).
// This is the founder's only visibility into incoming claimants.
// =========================================================================
function FoundItemCard({
  item,
  founderEmail,
  chatConfidenceThreshold = 50,
}: {
  item: TrueOwnerItem;
  founderEmail: string;
  chatConfidenceThreshold?: number;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [chattingThread, setChattingThread] = useState<ChatThread | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const itemId = item._id || item.id || "";

  useEffect(() => {
    if (!founderEmail) return;
    let cancelled = false;
    fetchMyThreads(founderEmail)
      .then((all) => {
        if (!cancelled) setThreads(all.filter((t) => t.foundItemId === itemId));
      })
      .catch(() => {
        /* founder just won't see the incoming-chat panel if this fails */
      });
    return () => {
      cancelled = true;
    };
  }, [founderEmail, itemId]);

  const statusLabel: Record<ChatThread["status"], string> = {
    chat: "Chatting — awaiting your verification",
    verifying: "Verification in progress",
    verification_pending: "Verification in progress",
    verified: "Ownership verified — meet for handover",
    handed_over: "Handover complete & closed",
    resolved: "Verified & resolved",
    closed: "Closed",
    frozen: "Frozen — under review",
  };

  return (
    <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex flex-col gap-3">
      {item.imageUrl && (
        <div
          className="relative rounded-xl overflow-hidden border border-paperDark cursor-pointer group bg-black/5"
          onClick={() => setViewingImage(item.imageUrl || null)}
          title="Click to view full image"
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-44 object-contain rounded-xl transition-transform group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-2xs">
            <Eye className="w-4 h-4" /> Click to view full image
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md">
          Unlisted &amp; Protected
        </span>
        <span className="text-xs text-ink/50">{item.location}</span>
      </div>
      <h3 className="font-display text-base text-ink">{item.title}</h3>
      <p className="text-xs text-ink/65 leading-relaxed line-clamp-3">
        {item.description}
      </p>

      {threads.length > 0 && (
        <div className="mt-1 pt-3 border-t border-paperDark flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-purple flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {threads.length} claimant{threads.length > 1 ? "s" : ""} matched for chat ({chatConfidenceThreshold}%+)
          </span>
          {threads.map((t) => (
            <button
              key={t.threadId}
              onClick={() => setChattingThread(t)}
              className="flex items-center justify-between bg-paper hover:bg-paperDark/50 transition-colors rounded-lg px-3 py-2 text-left"
            >
              <span className="text-xs text-ink/75">{statusLabel[t.status]}</span>
              <span className="text-[10px] text-sky font-semibold">{t.confidence}%</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-paperDark text-[11px] text-ink/50">
        Photo stored on Cloudinary &bull; Protected from public browsing
      </div>

      {chattingThread && (
        <ChatPanel
          complaintId={chattingThread.complaintId}
          foundItemId={chattingThread.foundItemId}
          currentEmail={founderEmail}
          isFounder
          itemTitle={item.title}
          onClose={() => setChattingThread(null)}
          onVerificationUnlocked={() => {}}
        />
      )}

      {viewingImage && (
        <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}
    </div>
  );
}

// Auto-clean & format user text for high CLIP neural embedding accuracy
function autoFormatText(text: string): string {
  if (!text) return "";
  let t = text.replace(/\s+/g, " ").trim();
  // Ensure space after punctuation
  t = t.replace(/\s*([,.:;?!])\s*/g, "$1 ");
  // Capitalize start of sentences
  t = t.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  // Standardize common brand/model keywords
  const brands: Record<string, string> = {
    samsung: "Samsung",
    iphone: "iPhone",
    apple: "Apple",
    oneplus: "OnePlus",
    vivo: "Vivo",
    oppo: "Oppo",
    realme: "Realme",
    redmi: "Redmi",
    xiaomi: "Xiaomi",
    dell: "Dell",
    hp: "HP",
    lenovo: "Lenovo",
    asus: "Asus",
    titan: "Titan",
    boat: "boAt",
    fastrack: "Fastrack",
  };
  for (const [k, v] of Object.entries(brands)) {
    const reg = new RegExp(`\\b${k}\\b`, "gi");
    t = t.replace(reg, v);
  }
  return t.trim();
}

// =========================================================================
// Hackathon Demo Templates for 24suca17@tcarts.in & 24suca111@tcarts.in
// Either can act as loster or founder interchangeably with full AI workflow
// =========================================================================
const DEMO_TEMPLATES = [
  {
    name: "Dell Inspiron 15 Laptop",
    icon: "💻",
    category: "Electronics",
    location: "Library Block",
    lost: {
      title: "Dell Inspiron 15 3520 Laptop",
      description: "Carbon black Dell Inspiron 15-inch laptop with Intel Core i5 processor sticker on the palm rest. Clean display with matte finish.",
      secretFeatures: "Small yellow Pikachu sticker on the bottom left corner near battery\nTiny hairline scratch next to HDMI port",
    },
    found: {
      title: "Dell Inspiron 15 3520 Laptop",
      description: "Found a black Dell laptop in the reading hall. Preserved safely with security desk.",
      challenges: [
        { question: "What sticker is located on the bottom left corner of the laptop casing?", answer: "Yellow Pikachu sticker" },
        { question: "Are there any distinctive marks near the ports?", answer: "Hairline scratch near HDMI port" },
      ],
      // Dell Laptop
      sampleImagePath: "/demo/dell_laptop.jpg",
      sampleImageName: "dell_laptop_demo",
    },
  },
  {
    name: "Titan Brown Leather Wallet",
    icon: "👛",
    category: "Wallet / Purse",
    location: "TK Block",
    lost: {
      title: "Titan Brown Leather Wallet",
      description: "Brown bifold genuine leather wallet with embossed Titan logo on the corner. Contains ID card and college bus pass.",
      secretFeatures: "Student ID card ending with roll number 17 inside the transparent pocket\nSilver lucky coin in the zipper compartment",
    },
    found: {
      title: "Titan Brown Leather Wallet",
      description: "Found a brown leather wallet near TK Block 2nd floor staircase. Kept safe.",
      challenges: [
        { question: "What is stored inside the transparent ID card pocket?", answer: "Student ID card ending in 17" },
        { question: "What special coin or item is in the zipper compartment?", answer: "Silver lucky coin" },
      ],
      sampleImagePath: "/demo/titan_wallet.jpg",
      sampleImageName: "titan_wallet_demo",
    },
  },
];

// =========================================================================
// Component: Form Modal (File Lost Complaint or Report Found Item)
// =========================================================================
function ItemFormModal({
  type,
  onClose,
  onSuccess,
}: {
  type: "lost" | "found";
  onClose: () => void;
  onSuccess: (data: { type: "lost" | "found"; title: string }) => void;
}) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  // Secret feature for lost (one per line -> array)
  const [secretFeatures, setSecretFeatures] = useState("");
  // Challenge questions + secret answers for found (1 to 3 questions)
  const [challenges, setChallenges] = useState<{ question: string; answer: string }[]>([
    { question: "", answer: "" },
  ]);

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  function createSampleImageFile(name: string, label: string): File {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 480, 360);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#312e81");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 480, 360);

      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 440, 320);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, 240, 160);

      ctx.fillStyle = "#c7d2fe";
      ctx.font = "14px sans-serif";
      ctx.fillText("Campus Verified Item Photo (Demo)", 240, 200);

      ctx.fillStyle = "#a5b4fc";
      ctx.font = "12px sans-serif";
      ctx.fillText("Stay-Composed Hackathon Verification", 240, 230);
    }
    const dataUrl = canvas.toDataURL("image/png");
    const arr = dataUrl.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${name}.png`, { type: "image/png" });
  }

  async function handleApplyDemo(index: number) {
    const tmpl = DEMO_TEMPLATES[index];
    if (!tmpl) return;

    setTitle(type === "lost" ? tmpl.lost.title : tmpl.found.title);
    setCategory(tmpl.category);
    setLocation(tmpl.location);
    setLocationDetail("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription(type === "lost" ? tmpl.lost.description : tmpl.found.description);

    if (type === "lost") {
      setSecretFeatures(tmpl.lost.secretFeatures);
    } else {
      setChallenges(tmpl.found.challenges);
      try {
          const res = await fetch(tmpl.found.sampleImagePath);
          const blob = await res.blob();
          const demoFile = new File([blob], tmpl.found.sampleImageName + ".jpg", { type: blob.type });
          setImageFile(demoFile);
          setImagePreview(URL.createObjectURL(demoFile));
        } catch (e) {
          console.error("Failed to load demo image:", e);
        }
    }
    setErrorMsg("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!session?.user?.email) {
      setErrorMsg("You must be signed in with your college account to submit a report.");
      return;
    }

    // Common compulsory fields for both Lost and Found
    if (!title.trim()) {
      setErrorMsg("Please enter a product title / name.");
      return;
    }

    if (!category.trim()) {
      setErrorMsg("Please select a category.");
      return;
    }

    if (!date) {
      setErrorMsg(`Please select the date the item was ${type === "lost" ? "lost" : "found"}.`);
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please provide a general description (color, model, exterior traits).");
      return;
    }

    if (location === OTHERS_LOCATION && !locationDetail.trim()) {
      setErrorMsg("Please describe the unlisted campus location.");
      return;
    }

    // Role-specific validation
    if (type === "lost") {
      // Claimant MUST provide secret features (Compulsory)
      if (!secretFeatures.trim()) {
        setErrorMsg("Please specify the secret features only you know. This is required to verify true ownership.");
        return;
      }
      // Note: location & image are optional for lost
    } else {
      // Founder MUST provide location
      if (!location.trim()) {
        setErrorMsg("Location is compulsory for found items — please specify exactly where you found it.");
        return;
      }

      // Founder MUST upload an image
      if (!imageFile && !imagePreview) {
        setErrorMsg("For found items, uploading a photo is COMPULSORY. Please select an image.");
        return;
      }

      // Founder MUST set challenge question(s) + secret answer(s)
      const validChallenges = challenges.filter(
        (c) => c.question.trim() && c.answer.trim()
      );
      if (validChallenges.length === 0) {
        setErrorMsg("Please provide at least one Ownership Challenge Question and Secret Answer.");
        return;
      }
    }

    setSubmitting(true);
    let finalImageUrl = "";

    try {
      // 1. Upload image to Cloudinary if file provided
      if (imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image to Cloudinary");
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
        setUploadingImage(false);
      }

      // 2. Submit item straight to the FastAPI backend (CLIP embedding, hashing,
      //    and storage all happen there — this used to hit a dead Next.js mock route)
      const api = getApiClient();
      await api.post("/items", {
        type,
        title,
        category,
        location: location || undefined,
        locationDetail: location === OTHERS_LOCATION ? locationDetail : undefined,
        date,
        description,
        imageUrl: finalImageUrl || undefined,
        secretFeatures:
          type === "lost"
            ? secretFeatures.split("\n").map((s) => s.trim()).filter(Boolean)
            : undefined,
        challengeQuestions:
          type === "found"
            ? challenges.map((c) => c.question.trim()).filter(Boolean)
            : undefined,
        secretAnswers:
          type === "found"
            ? challenges.map((c) => c.answer.trim()).filter(Boolean)
            : undefined,
        reporterEmail: session!.user!.email,
        reporterName: session!.user!.name || undefined,
      });

      onSuccess({ type, title });
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err?.response?.data?.detail || err?.message || "An error occurred during submission.");
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Wider on desktop (max-w-3xl instead of max-w-xl), and capped to the viewport height
          with internal scroll so the whole modal always stays visible on short/small screens. */}
      <div className="bg-white border border-paperDark rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-paperDark mb-4">
          <div>
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                type === "lost"
                  ? "bg-purple/10 text-purple"
                  : "bg-sky/10 text-sky"
              }`}
            >
              {type === "lost" ? "Lost Item Complaint" : "Register Found Item"}
            </span>
            <h2 className="font-display text-lg sm:text-xl text-ink mt-1">
              {type === "lost" ? "File a Lost Complaint" : "Report a Found Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-paper flex items-center justify-center text-ink/60 hover:text-ink font-semibold"
          >
            &times;
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 bg-brick/10 border border-brick/30 rounded-xl p-2.5 text-xs text-brick flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hackathon Quick-Fill Demo Templates Banner */}
        <div className="mb-4 bg-purple/5 border border-purple/20 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple/10 text-purple flex items-center justify-center shrink-0 font-bold">
              ⚡
            </div>
            <div>
              <span className="text-xs font-bold text-ink block">Hackathon Quick-Fill Demo Templates</span>
              <span className="text-[11px] text-ink/65 block">
                Visible 1-click pre-fill for <strong>24suca17@tcarts.in</strong> &amp; <strong>24suca111@tcarts.in</strong> (either can act as loster or founder).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleApplyDemo(0)}
              className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-paperDark text-ink hover:border-purple hover:text-purple transition-all shadow-2xs whitespace-nowrap"
            >
              💻 Dell Laptop Demo
            </button>
            <button
              type="button"
              onClick={() => handleApplyDemo(1)}
              className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-paperDark text-ink hover:border-purple hover:text-purple transition-all shadow-2xs whitespace-nowrap"
            >
              👛 Titan Wallet Demo
            </button>
          </div>
        </div>

        {/* Two columns on md+ screens so the form spreads wide instead of stacking tall */}
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-ink/75 block mb-1">
              Product Name / Title *
            </label>
            <input
              type="text"
              placeholder={type === "lost" ? "e.g. Matte Black HP Pavilion 15 Laptop" : "e.g. Silver Titan Watch with metal strap"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitle(autoFormatText(title))}
              spellCheck={true}
              autoCorrect="on"
              autoCapitalize="sentences"
              required
              className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
            />
          </div>

          {/* Category / Date / Location share one compact row on md+ instead of three stacked rows */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink/75 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink/75 block mb-1">
                {type === "lost" ? "Date Lost" : "Date Found"}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink/75 block mb-1">
                Campus Location{" "}
                {type === "found" ? (
                  <span className="text-brick">(COMPULSORY — where exactly did you find it?)</span>
                ) : (
                  <span className="text-ink/40">(optional)</span>
                )}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={Boolean(type === "found" && !imageFile && !imagePreview)}
                className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white"
              >
                <option value="">{type === "found" ? "Select where you found it..." : "Not specified"}</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {location === OTHERS_LOCATION && (
                <input
                  type="text"
                  placeholder="Describe the unlisted location..."
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  required={type === "found"}
                  className="w-full mt-2 border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
                />
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-ink/75 block">
                General Description (Public Visible Traits) *
              </label>
              {description.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setDescription(autoFormatText(description))}
                  className="text-[10px] text-purple hover:text-blue font-semibold flex items-center gap-1 bg-purple/5 px-2 py-0.5 rounded-md"
                >
                  <Sparkles className="w-3 h-3 text-purple" /> Auto-Fix Spelling &amp; Formatting
                </button>
              )}
            </div>
            <textarea
              placeholder={
                type === "lost"
                  ? "Describe color, brand, approximate size, and visible exterior."
                  : "Describe visible characteristics without revealing hidden identifying details."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setDescription(autoFormatText(description))}
              spellCheck={true}
              autoCorrect="on"
              autoCapitalize="sentences"
              required
              rows={2}
              className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender resize-none"
            />
          </div>

          {/* SECRET FEATURES (lost) / CHALLENGE QUESTION (found) sits side-by-side with the
              image upload block on md+ screens, instead of stacking as two full-width rows. */}
          {type === "lost" ? (
            <div className="bg-purple/5 border border-purple/20 rounded-xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-purple font-semibold text-xs">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Secret Verification Feature (COMPULSORY) *</span>
              </div>
              <p className="text-[10px] text-ink/60 leading-snug">
                Detail(s) only <strong>you</strong> know (scratch, sticker, engraving...). One per line if more than one. Never shown publicly — used to verify true ownership.
              </p>
              <textarea
                placeholder={"e.g. Faded blue dinosaur sticker on the inner flap\nDeep scratch near the charging port"}
                value={secretFeatures}
                onChange={(e) => setSecretFeatures(e.target.value)}
                required
                rows={3}
                className="w-full border border-purple/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white resize-none"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink/75">
                  Ownership Challenge Questions (1 to 3) *
                </label>
                <span className="text-[10px] text-ink/50">
                  Majority match required to verify true owner
                </span>
              </div>

              {challenges.map((c, idx) => (
                <div
                  key={idx}
                  className="bg-paper/40 border border-paperDark rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple">
                      Question #{idx + 1}
                    </span>
                    {challenges.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setChallenges(challenges.filter((_, i) => i !== idx))
                        }
                        className="text-xs text-brick hover:underline font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. What sticker is on the back? What wallpaper is on the lock screen?"
                    value={c.question}
                    onChange={(e) => {
                      const next = [...challenges];
                      next[idx].question = e.target.value;
                      setChallenges(next);
                    }}
                    required
                    className="w-full border border-paperDark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white"
                  />

                  <label className="text-xs font-semibold text-ink/75 flex items-center gap-1 mt-1">
                    <Lock className="w-3.5 h-3.5 text-purple shrink-0" />
                    Secret Answer #{idx + 1} (Hashed &bull; Never shown to claimant) *
                  </label>
                  <input
                    type="text"
                    placeholder="The exact identifying secret answer"
                    value={c.answer}
                    onChange={(e) => {
                      const next = [...challenges];
                      next[idx].answer = e.target.value;
                      setChallenges(next);
                    }}
                    required
                    className="w-full border border-paperDark rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white"
                  />
                </div>
              ))}

              {challenges.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setChallenges([...challenges, { question: "", answer: "" }])
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky hover:text-blue self-start py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add another challenge question (up to 3)
                </button>
              )}
            </div>
          )}

          {/* IMAGE UPLOAD: COMPULSORY FOR FOUND, OPTIONAL FOR LOST */}
          <div className="border border-paperDark rounded-xl p-3 sm:p-4 bg-paper/40 flex flex-col justify-between gap-3 h-full">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-ink/80 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple shrink-0" />
                  {type === "found" ? (
                    <span className="text-brick font-bold">Product Image (COMPULSORY) *</span>
                  ) : (
                    <span>Product Photo (Optional)</span>
                  )}
                </label>
                {type === "found" && (
                  <span className="text-[10px] bg-brick/10 text-brick px-2 py-0.5 rounded-full font-semibold shrink-0">
                    Required
                  </span>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-ink/65 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple file:text-white hover:file:bg-blue cursor-pointer"
              />
            </div>

            {imagePreview ? (
              <div
                className="flex-1 min-h-[160px] max-h-[360px] flex flex-col items-center justify-center relative rounded-xl overflow-hidden border border-paperDark bg-black/5 group cursor-pointer"
                onClick={() => setViewingImage(imagePreview)}
                title="Click to view full image"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full min-h-[160px] max-h-[340px] object-contain rounded-lg p-1 transition-transform group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-2xs">
                  <Eye className="w-4 h-4" /> Click to view full image
                </div>
                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Full View Available
                </span>
              </div>
            ) : (
              <div className="flex-1 min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed border-paperDark rounded-xl p-4 text-center bg-white/40">
                <ImageIcon className="w-8 h-8 text-ink/20 mb-1.5" />
                <p className="text-xs font-medium text-ink/60">No image selected yet</p>
                <p className="text-[10px] text-ink/40 mt-0.5">
                  {type === "found"
                    ? "Photo dynamically expands to match challenge questions"
                    : "Add photo to help AI match visual traits"}
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2 border-t border-paperDark mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-ink/70 hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white transition-all shadow-xs disabled:opacity-50 ${
                type === "lost"
                  ? "bg-purple hover:bg-blue"
                  : "bg-sky hover:bg-blue"
              }`}
            >
              {submitting
                ? uploadingImage
                  ? "Uploading to Cloudinary..."
                  : "Submitting..."
                : type === "lost"
                ? "File Complaint with Secret Features"
                : "Register Found Item (Cloudinary)"}
            </button>
          </div>
        </form>

        {viewingImage && (
          <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
        )}
      </div>
    </div>
  );
}
