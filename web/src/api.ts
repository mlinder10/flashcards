import axios from "axios";
import {
  Class,
  Flashcard,
  ProtectionLevel,
  UnsavedFlashcard,
  User,
} from "./types";

const BASE_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

const server = axios.create({
  baseURL: BASE_URL,
});

export const TOKEN_KEY = "flashcards-token";

server.interceptors.request.use((req) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const api = {
  // User

  login: async (email: string, password: string) => {
    return server.post<User>("/auth/login", { email, password });
  },

  register: async (name: string, email: string, password: string) => {
    return server.post<User>("/auth/register", { name, email, password });
  },

  quietLogin: async () => {
    return server.get<User>("/auth/login");
  },

  logout: async () => {
    return server.post<string>("/auth/logout");
  },

  // Class

  fetchClasses: async () => {
    return server.get<Class[]>("/protected/class");
  },

  createClass: async (
    university: string,
    department: string,
    courseNumber: string,
    name: string,
    description: string,
    protection: ProtectionLevel
  ) => {
    return server.post<Class>("/protected/class/create", {
      university,
      department,
      courseNumber,
      name,
      description,
      protection,
    });
  },

  // Flashcards

  fetchFlashcards: async (
    classId: string,
    limit: number = 10,
    offset: number = 0
  ) => {
    return server.get<Flashcard[]>(
      `/protected/flashcard/${classId}?limit=${limit}&offset=${offset}`
    );
  },

  saveFlashcards: async (
    rawFlashcards: UnsavedFlashcard[],
    classId: string
  ) => {
    return server.post<Flashcard[]>(`/protected/flashcard/create`, {
      rawFlashcards,
      classId,
    });
  },

  updateFlashcards: async (flashcards: UnsavedFlashcard[], classId: string) => {
    return server.post<string>(`/protected/flashcard/batch-update`, {
      flashcards,
      classId,
    });
  },

  deleteFlashcards: async (flashcardIds: string[]) => {
    return server.post(`/protected/flashcard/delete`, {
      cardIds: flashcardIds,
    });
  },

  // Generate

  generateFlashcardsFromNotes: async (notes: string) => {
    return server.post<UnsavedFlashcard[]>("/protected/generate", {
      notes,
      type: "notes",
    });
  },

  generateFlashcardsFromSyllabus: async (syllabus: string) => {
    return server.post<UnsavedFlashcard[]>("/protected/generate", {
      syllabus,
      type: "syllabus",
    });
  },

  generateFlashcardsFromCourseInfo: async (
    courseName: string,
    university: string,
    level: string
  ) => {
    return server.post<UnsavedFlashcard[]>("/generate", {
      courseInfo: {
        courseName,
        university,
        level,
      },
      type: "courseInfo",
    });
  },
};
