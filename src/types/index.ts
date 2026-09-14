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
  secretFeatures?: string;
  challengeQuestion?: string; // Prompt/question set for ownership challenge
  reportedBy: string; // masked display name, e.g. "Campus Member #4821"
  reportedByUserId?: string;
  reportedByEmail?: string;
  status: "open" | "matched" | "verified" | "resolved";
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

export interface MaskedUser {
  userId: string;
  displayName: string; // masked, e.g. "Student #4821"
  email: string; // college email, not shown publicly
}