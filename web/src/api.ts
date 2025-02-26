import axios from "axios";
import { Class, Flashcard, ProtectionLevel, User } from "./types";

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

  createClass: async (name: string, protection: ProtectionLevel) => {
    return server.post<Class>("/protected/class/create", { name, protection });
  },

  // Flashcards

  fetchFlashcards: async (classId: string) => {
    return server.get<Flashcard[]>(`/protected/flashcard/${classId}`);
  },

  saveFlashcard: async (front: string, back: string, classId: string) => {
    return server.post<Flashcard>(`/protected/flashcard/create-one`, {
      front,
      back,
      classId,
    });
  },

  generateFlashcards: async (syllabus: string) => {
    return server.post<Flashcard[]>("/generate", { syllabus });
  },
};
