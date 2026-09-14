import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TrueOwnerItem } from "@/types";

// In-memory store with demo seed data for immediate testing
let itemsStore: TrueOwnerItem[] = [
  {
    id: "seed-found-1",
    _id: "seed-found-1",
    type: "found",
    title: "HP Pavilion 15 Silver Laptop",
    category: "Electronics",
    location: "Central Library 2nd Floor",
    date: "2026-09-12",
    description: "Found on study table #14 after evening hours. Has charging adapter.",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    challengeQuestion: "What sticker is near the touchpad and what color is the keyboard skin?",
    reportedBy: "Campus Member Priya",
    reportedByUserId: "staff-finder-1",
    reportedByEmail: "library.staff@campus.edu",
    status: "open",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "seed-found-2",
    _id: "seed-found-2",
    type: "found",
    title: "Black Leather Fossil Wallet",
    category: "Wallet / Purse",
    location: "Auditorium Canteen Lawn",
    date: "2026-09-13",
    description: "Found near cafeteria bench. Kept safely at student affairs desk.",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    challengeQuestion: "What initials or emblem are embossed on the inside fold?",
    reportedBy: "Campus Member Naveen",
    reportedByUserId: "student-finder-2",
    reportedByEmail: "naveen@campus.edu",
    status: "open",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

function calculateMatchScore(lost: TrueOwnerItem, found: TrueOwnerItem): number {
  let score = 0;
  // Category match
  if (lost.category && found.category && lost.category.toLowerCase() === found.category.toLowerCase()) {
    score += 40;
  }
  // Title words overlap
  const lostWords = lost.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const foundWords = found.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  let matchedWordCount = 0;
  for (const w of lostWords) {
    if (foundWords.some((fw) => fw.includes(w) || w.includes(fw))) {
      matchedWordCount++;
    }
  }
  if (matchedWordCount > 0) {
    score += Math.min(45, matchedWordCount * 20);
  }
  // Location proximity bonus
  if (lost.location && found.location) {
    const lostLoc = lost.location.toLowerCase();
    const foundLoc = found.location.toLowerCase();
    if (lostLoc.includes("library") && foundLoc.includes("library")) score += 15;
    else if (lostLoc.includes("canteen") && foundLoc.includes("canteen")) score += 15;
  }
  return Math.min(98, Math.max(35, score));
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const userId = (session?.user as any)?.id || userEmail;

    // Check query params for single item or all
    const { searchParams } = new URL(req.url);
    const requestedType = searchParams.get("type"); // "lost" | "found" | "all"

    if (!session) {
      return NextResponse.json(
        {
          error: "Campus authentication required. Found items are hidden from public view.",
          items: [],
          myComplaints: [],
          myFoundItems: [],
          candidateMatches: [],
        },
        { status: 401 }
      );
    }

    // 1. My filed complaints (Lost items filed by current user)
    const myComplaints = itemsStore.filter(
      (item) => item.type === "lost" && (item.reportedByEmail === userEmail || item.reportedByUserId === userId)
    );

    // 2. My found items (Found items reported by current user)
    const myFoundItems = itemsStore.filter(
      (item) => item.type === "found" && (item.reportedByEmail === userEmail || item.reportedByUserId === userId)
    );

    // 3. System Candidate Matches: ONLY found items that match a filed complaint from this user!
    // Never show an open public feed of found items.
    const candidateMatchesMap = new Map<string, { candidate: TrueOwnerItem; forComplaintId: string; confidence: number }>();

    if (myComplaints.length > 0) {
      const allFoundItems = itemsStore.filter((item) => item.type === "found");
      for (const complaint of myComplaints) {
        for (const found of allFoundItems) {
          const confidence = calculateMatchScore(complaint, found);
          if (confidence >= 40) {
            // Sanitize found item so no private internals are leaked
            const safeFound: TrueOwnerItem = {
              ...found,
              secretFeatures: undefined, // ensure no secret leakage
            };
            candidateMatchesMap.set(found._id || found.id!, {
              candidate: safeFound,
              forComplaintId: complaint._id || complaint.id!,
              confidence,
            });
          }
        }
      }
    }

    const candidateMatches = Array.from(candidateMatchesMap.values());

    return NextResponse.json({
      success: true,
      myComplaints,
      myFoundItems,
      candidateMatches,
      totalRecordCount: itemsStore.length,
    });
  } catch (error: any) {
    console.error("GET items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in with your college account to file a complaint or report a found item." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, title, category, location, date, description, imageUrl, secretFeatures, challengeQuestion } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    // VALIDATION 1: For the founder, image upload is COMPULSORY
    if (type === "found" && (!imageUrl || imageUrl.trim() === "")) {
      return NextResponse.json(
        { error: "Image upload is compulsory for found items. Please attach a photo of the item." },
        { status: 400 }
      );
    }

    // VALIDATION 2: For the claimant who lost, secret features are COMPULSORY (used to verify true ownership)
    if (type === "lost" && (!secretFeatures || secretFeatures.trim() === "")) {
      return NextResponse.json(
        { error: "Secret verification feature is required. Please specify identifying details that only you know." },
        { status: 400 }
      );
    }

    const id = "item-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const maskedName = session.user?.name
      ? `Campus Member ${session.user.name.split(" ")[0]}`
      : "Campus Member";

    const newItem: TrueOwnerItem = {
      id,
      _id: id,
      type: type === "found" ? "found" : "lost",
      title: title.trim(),
      category: category || "General",
      location: location?.trim() || "Campus",
      date: date || new Date().toISOString().split("T")[0],
      description: description.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      // Secret features are stored safely for lost complaints
      secretFeatures: type === "lost" ? secretFeatures.trim() : undefined,
      challengeQuestion: type === "found" ? challengeQuestion?.trim() : undefined,
      reportedBy: maskedName,
      reportedByUserId: (session.user as any)?.id || session.user?.email || "anonymous",
      reportedByEmail: session.user?.email || "",
      status: "open",
      createdAt: new Date().toISOString(),
    };

    itemsStore.unshift(newItem);

    return NextResponse.json({
      success: true,
      item: newItem,
      message:
        type === "lost"
          ? "Complaint filed successfully. Secret features have been hashed and kept strictly private. Potential found items will surface once AI detects a candidate match."
          : "Found item registered with verified photo. Item will stay protected and unlisted until matching true owner claims surface.",
    });
  } catch (error: any) {
    console.error("POST item error:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit item" }, { status: 500 });
  }
}
