"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getApiClient } from "@/lib/apiClient";
import { ClaimResult, TrueOwnerItem } from "@/types";
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

export default function TrueOwnerPage() {
  const { data: session } = useSession();
  const [myComplaints, setMyComplaints] = useState<TrueOwnerItem[]>([]);
  const [myFoundItems, setMyFoundItems] = useState<TrueOwnerItem[]>([]);
  const [candidateMatches, setCandidateMatches] = useState<
    { candidate: TrueOwnerItem; forComplaintId: string; confidence: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"complaints" | "matches" | "my-found">("complaints");
  const [backendError, setBackendError] = useState(false);

  // Form modal state
  const [formType, setFormType] = useState<"lost" | "found" | null>(null);

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
    } catch (err) {
      console.error("Failed to load True Owner data from backend:", err);
      setBackendError(true);
    } finally {
      setLoading(false);
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

        <div className="flex flex-wrap items-center gap-3">
          {session ? (
            <>
              <button
                onClick={() => setFormType("lost")}
                className="inline-flex items-center gap-2 bg-purple text-white px-5 py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-blue transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                File Lost Complaint
              </button>
              <button
                onClick={() => setFormType("found")}
                className="inline-flex items-center gap-2 bg-white text-ink border border-paperDark px-5 py-3 rounded-full text-xs sm:text-sm font-semibold hover:border-sky hover:text-sky transition-all shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Report Found Item
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 bg-purple text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-blue transition-all shadow-xs"
            >
              <Lock className="w-4 h-4" />
              Sign in with Campus Account
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] 2xl:grid-cols-[380px_1fr] gap-8 xl:gap-10">
        {/* Sidebar */}
        <aside className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-6">
          {!session ? (
            <div className="bg-white border border-paperDark rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-4 shadow-xs">
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

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paperDark pb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("complaints")}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === "complaints"
                        ? "bg-purple text-white shadow-xs"
                        : "bg-white text-ink/70 border border-paperDark hover:border-purple"
                    }`}
                  >
                    My Filed Complaints ({myComplaints.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("matches")}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === "matches"
                        ? "bg-sky text-white shadow-xs"
                        : "bg-white text-ink/70 border border-paperDark hover:border-sky"
                    }`}
                  >
                    AI Candidate Matches ({candidateMatches.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("my-found")}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
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
                        <FoundItemCard key={item._id || item.id} item={item} />
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
          onSuccess={() => {
            setFormType(null);
            fetchTrueOwnerData();
          }}
        />
      )}
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
  onClaimed,
}: {
  complaint: TrueOwnerItem;
  matches: { candidate: TrueOwnerItem; confidence: number }[];
  claimantEmail: string;
  onClaimed: () => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [claiming, setClaiming] = useState<TrueOwnerItem | null>(null);

  return (
    <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-paperDark pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-purple bg-purple/10 px-2.5 py-0.5 rounded-md">
              Lost Complaint
            </span>
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

      {/* General Description */}
      <div className="text-xs sm:text-sm text-ink/75 leading-relaxed">
        <strong className="text-ink block mb-1">General Description:</strong>
        {complaint.description}
      </div>

      {/* Secret Verification Features (The Core Differentiator) */}
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

      {/* Candidate Matches for this complaint */}
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
                  <img
                    src={candidate.imageUrl}
                    alt={candidate.title}
                    className="w-full h-36 object-cover rounded-lg border border-paperDark"
                  />
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
                  onClick={() => setClaiming(candidate)}
                  className="bg-purple text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue transition-colors self-start shadow-xs"
                >
                  Verify Ownership (Answer Challenge)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {claiming && (
        <ClaimModal
          complaintId={complaint._id || complaint.id || ""}
          found={claiming}
          claimantEmail={claimantEmail}
          onClose={() => setClaiming(null)}
          onVerified={() => {
            setClaiming(null);
            onClaimed();
          }}
        />
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
  onClaimed,
}: {
  candidate: TrueOwnerItem;
  confidence: number;
  forComplaintId: string;
  claimantEmail: string;
  onClaimed: () => void;
}) {
  const [claiming, setClaiming] = useState(false);

  return (
    <div className="bg-white border border-paperDark rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {candidate.imageUrl && (
          <img
            src={candidate.imageUrl}
            alt={candidate.title}
            className="w-full h-48 object-cover rounded-xl border border-paperDark"
          />
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
          onClick={() => setClaiming(true)}
          className="bg-purple text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue transition-colors shadow-xs"
        >
          Claim This Match
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-paperDark rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
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

        {!result ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-xs text-ink/65 leading-relaxed">
              Only the true owner can answer these correctly. A majority of your answers must match
              the finder&apos;s hidden secret details &mdash; hashed and never shown to anyone, even admins.
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
                {submitting ? "Verifying..." : "Submit Answers"}
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
      </div>
    </div>
  );
}

// =========================================================================
// Component: Found Item Card (In Tab 3)
// =========================================================================
function FoundItemCard({ item }: { item: TrueOwnerItem }) {
  return (
    <div className="bg-white border border-paperDark rounded-2xl p-5 shadow-xs flex flex-col gap-3">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-44 object-cover rounded-xl border border-paperDark"
        />
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
      <div className="mt-2 pt-2 border-t border-paperDark text-[11px] text-ink/50">
        Photo stored on Cloudinary &bull; Protected from public browsing
      </div>
    </div>
  );
}

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
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  // Secret feature for lost
  const [secretFeatures, setSecretFeatures] = useState("");
  // Challenge question for found
  const [challengeQuestion, setChallengeQuestion] = useState("");

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    // Validation: Founder MUST upload an image
    if (type === "found" && !imageFile && !imagePreview) {
      setErrorMsg("For found items, uploading a photo is COMPULSORY. Please select an image.");
      return;
    }

    // Validation: Claimant MUST provide secret features
    if (type === "lost" && !secretFeatures.trim()) {
      setErrorMsg("Please specify the secret features only you know. This is required to verify true ownership.");
      return;
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

      // 2. Submit item to API
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          category,
          location,
          date,
          description,
          imageUrl: finalImageUrl,
          secretFeatures: type === "lost" ? secretFeatures : undefined,
          challengeQuestion: type === "found" ? challengeQuestion : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err?.message || "An error occurred during submission.");
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

        {/* Two columns on md+ screens so the form spreads wide instead of stacking tall */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-ink/75 block mb-1">
              Product Name / Title *
            </label>
            <input
              type="text"
              placeholder={type === "lost" ? "e.g. Matte Black HP Pavilion 15 Laptop" : "e.g. Silver Titan Watch with metal strap"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                Campus Location
              </label>
              <input
                type="text"
                placeholder={type === "lost" ? "e.g. Library" : "e.g. Auditorium"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-ink/75 block mb-1">
              General Description (Public Visible Traits) *
            </label>
            <textarea
              placeholder={
                type === "lost"
                  ? "Describe color, brand, approximate size, and visible exterior."
                  : "Describe visible characteristics without revealing hidden identifying details."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                A detail only <strong>you</strong> know (scratch, sticker, engraving...). Never shown publicly — used to verify true ownership.
              </p>
              <textarea
                placeholder="e.g. Faded blue dinosaur sticker on the inner flap, deep scratch near the charging port."
                value={secretFeatures}
                onChange={(e) => setSecretFeatures(e.target.value)}
                required
                rows={3}
                className="w-full border border-purple/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender bg-white resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-ink/75 block mb-1">
                Ownership Challenge Question (Optional prompt for claimant)
              </label>
              <textarea
                placeholder="e.g. What sticker is on the back? What's written on the keychain?"
                value={challengeQuestion}
                onChange={(e) => setChallengeQuestion(e.target.value)}
                rows={3}
                className="w-full border border-paperDark rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender resize-none"
              />
            </div>
          )}

          {/* IMAGE UPLOAD: COMPULSORY FOR FOUND, OPTIONAL FOR LOST */}
          <div className="border border-paperDark rounded-xl p-3 bg-paper/40 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
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
              required={type === "found"}
              className="text-xs text-ink/65 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple file:text-white hover:file:bg-blue cursor-pointer"
            />

            {imagePreview && (
              <div className="mt-1 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-20 object-cover rounded-lg border border-paperDark"
                />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                  Uploads to Cloudinary
                </span>
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
      </div>
    </div>
  );
}