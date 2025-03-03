export type Flashcard = RawFlashcard & {
  id: string;
  createdAt: number;
  updatedAt: number;
  classId: string;
};

type RawFlashcard = {
  front: string;
  back: string;
};

export type UnsavedFlashcard = RawFlashcard & { id: string };

export type CourseInfo = {
  courseName: string;
  university: string;
  level: string;
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
  university: string;
  department: string;
  courseNumber: string;
  name: string;
  description: string;
  createdAt: number;
  userId: string;
  protection: ProtectionLevel;
};
