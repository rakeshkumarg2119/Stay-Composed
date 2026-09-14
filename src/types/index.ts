export interface LostFoundItem {
  _id?: string;
  type: "lost" | "found";
  title: string;
  description: string;
  imageUrl?: string;
  reportedBy: string; // masked display name
  reportedByUserId: string;
  status: "open" | "matched" | "resolved";
  createdAt: Date;
}

export interface BloodAlertRequest {
  _id?: string;
  studentName: string;
  bloodType: string;
  phoneNumber: string;
  department: string;
  createdAt: Date;
}

export interface MaskedUser {
  userId: string;
  displayName: string; // masked, e.g. "Student #4821"
  email: string; // college email, not shown publicly
}