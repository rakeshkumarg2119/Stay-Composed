export interface LostFoundItem {
  _id?: string;
  id?: string;
  type: "lost" | "found";
  title: string;
  category?: string;
  location?: string;
  date?: string;
  description: string;
  imageUrl?: string;
  cloudinaryPublicId?: string;
  // Secret verification features: ONLY for lost complaints, kept secret, never exposed publicly
  secretFeatures?: string[];
  challengeQuestions?: string[]; // Prompt/questions set for ownership challenge
  reportedBy: string; // masked display name, e.g. "Campus Member #4821"
  reportedByUserId?: string;
  reportedByEmail?: string;
  status: "open" | "matched" | "verified" | "handed_over" | "resolved";
  matchConfidence?: number;
  matchedItemId?: string;
  createdAt: string | Date;
}

export type TrueOwnerItem = LostFoundItem;

export interface BloodAlertRequest {
  _id?: string;
  studentName: string;
  bloodType: string;
  phoneNumber: string;
  department: string;
  senderEmail?: string;
  createdAt: Date | string;
}

export interface ClaimResult {
  verified: boolean;
  matchedFields: number;
  totalFields: number;
  message: string;
  cooldownUntil?: string | Date;
}

export interface ChatThread {
  threadId: string;
  complaintId: string;
  foundItemId: string;
  claimantEmail: string;
  founderEmail: string;
  claimantName?: string;
  founderName?: string;
  confidence: number;
  status: "chat" | "verifying" | "verified" | "handed_over" | "resolved" | "closed" | "frozen";
  createdAt: string | Date;
  verificationStartedAt?: string | Date | null;
  handedOverAt?: string | Date | null;
  heldMessageCount?: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderEmail: string;
  text: string;
  sentAt: string | Date;
}

export interface MaskedUser {
  userId: string;
  displayName: string; // masked, e.g. "Student #4821"
  email: string; // college email, not shown publicly
}