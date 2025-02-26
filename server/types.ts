export type Flashcard = RawFlashcard & {
  id: string;
  createdAt: number;
  updatedAt: number;
  classId: string;
};

export type RawFlashcard = {
  id?: string;
  front: string;
  back: string;
};

export type GenerateType = "syllabus" | "notes" | "courseInfo";

export type User = {
  id: string;
  name: string;
  email: string;
  token: string | null;
  createdAt: number;
  updatedAt: number;
  subscriptionStart: number | null;
  subscriptionEnd: number | null;
};

export type ProtectionLevel = "public" | "private" | "unlisted";

export type Class = {
  id: string;
  name: string;
  createdAt: number;
  userId: string;
  protection: ProtectionLevel;
};

export const SUBSCRIPTIONS = {
  // week: 60 * 60 * 24 * 7,
  month: {
    duration: 60 * 60 * 24 * 7 * 31,
    price: 9.99,
  },
  year: {
    duration: 60 * 60 * 24 * 7 * 365,
    price: 99.99,
  },
};

declare module "express-serve-static-core" {
  interface Request {
    user: User;
    isSubscribed: boolean;
  }
}
