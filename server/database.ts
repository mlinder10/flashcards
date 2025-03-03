import { createClient } from "@libsql/client";
import { config } from "dotenv";
import {
  Class,
  Flashcard,
  ProtectionLevel,
  RawFlashcard,
  UnsavedFlashcard,
  User,
} from "./types";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
config();

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_API_KEY = process.env.DATABASE_API_KEY;

if (!DATABASE_URL || !DATABASE_API_KEY) {
  throw new Error("DATABASE_URL and DATABASE_API_KEY must be set");
}

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_API_KEY,
});

type TursoResponse<T> = T | { message: string; code: number };

export function isError<T>(
  response: TursoResponse<T>
): response is { message: string; code: number } {
  return (
    typeof response === "object" &&
    response !== null &&
    "message" in response &&
    "code" in response
  );
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function comparePasswords(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

export const turso = {
  // User

  login: async (
    email: string,
    password: string
  ): Promise<TursoResponse<User>> => {
    try {
      const rs = await client.execute({
        sql: "SELECT * FROM users WHERE email = ?",
        args: [email],
      });
      if (rs.rows.length === 0)
        return { code: 401, message: "No user with this email" };
      const passwordsMatch = await comparePasswords(
        password,
        rs.rows[0].password as string
      );
      if (!passwordsMatch) {
        return { code: 401, message: "Incorrect email or password" };
      }
      const newToken = v4();
      await client.execute({
        sql: "UPDATE users SET token = ? WHERE id = ?",
        args: [newToken, rs.rows[0].id],
      });
      const user: User = {
        id: rs.rows[0].id as string,
        name: rs.rows[0].name as string,
        email: rs.rows[0].email as string,
        token: newToken,
        createdAt: rs.rows[0].created_at as number,
        updatedAt: rs.rows[0].updated_at as number,
        subscriptionStart: rs.rows[0].subscription_start as number | null,
        subscriptionEnd: rs.rows[0].subscription_end as number | null,
      };
      return user;
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to fetch user" };
    }
  },

  register: async (
    name: string,
    email: string,
    password: string,
    id = v4()
  ): Promise<TursoResponse<User>> => {
    try {
      const rs = await client.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [email],
      });
      if (rs.rows.length !== 0) {
        return {
          code: 400,
          message: "Email already registered with an account",
        };
      }
      const hashedPassword = await hashPassword(password);
      const token = v4();
      const currentTime = Date.now();
      const rs2 = await client.execute({
        sql: `
          INSERT INTO users
            (id, name, email, password, token, created_at, updated_at)
          VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          name,
          email,
          hashedPassword,
          token,
          currentTime,
          currentTime,
        ],
      });
      if (rs2.rowsAffected !== 1) {
        return { code: 500, message: "Failed to register user" };
      }
      const user: User = {
        id,
        name,
        email,
        token,
        createdAt: currentTime,
        updatedAt: currentTime,
        subscriptionStart: null,
        subscriptionEnd: null,
      };
      return user;
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to create user" };
    }
  },

  loginWithToken: async (token: string): Promise<TursoResponse<User>> => {
    try {
      const rs = await client.execute({
        sql: "SELECT * FROM users WHERE token = ?",
        args: [token],
      });
      if (rs.rows.length === 0)
        return { code: 401, message: "No user with this token" };
      const user: User = {
        id: rs.rows[0].id as string,
        name: rs.rows[0].name as string,
        email: rs.rows[0].email as string,
        token: rs.rows[0].token as string,
        createdAt: rs.rows[0].created_at as number,
        updatedAt: rs.rows[0].updated_at as number,
        subscriptionStart: rs.rows[0].subscription_start as number | null,
        subscriptionEnd: rs.rows[0].subscription_end as number | null,
      };
      return user;
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to fetch user" };
    }
  },

  logout: async (token: string): Promise<TursoResponse<string>> => {
    try {
      const rs = await client.execute({
        sql: "UPDATE users SET token = NULL WHERE token = ?",
        args: [token],
      });
      if (rs.rowsAffected === 0) {
        return { code: 404, message: "No user with this token" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to logout user" };
    }
  },

  subscribe: async (
    userId: string,
    duration: number
  ): Promise<TursoResponse<string>> => {
    try {
      const subscriptionStart = Date.now();
      const subscriptionEnd = subscriptionStart + duration;
      const rs = await client.execute({
        sql: `
          UPDATE users
            SET subscription_start = ?,
            subscription_end = ?,
            updated_at = ?
          WHERE
            id = ?
        `,
        args: [subscriptionStart, subscriptionEnd, subscriptionStart, userId],
      });
      if (rs.rowsAffected === 0) {
        return { code: 404, message: "No user with this id" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to create subscription" };
    }
  },

  deleteUser: async (userId: string): Promise<TursoResponse<string>> => {
    try {
      const rs = await client.execute({
        sql: "DELETE FROM users WHERE id = ?",
        args: [userId],
      });
      if (rs.rowsAffected === 0) {
        return { code: 404, message: "No user with this id" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to delete user" };
    }
  },

  // Class

  fetchClasses: async (userId: string): Promise<TursoResponse<Class[]>> => {
    try {
      const rs = await client.execute({
        sql: "SELECT * FROM classes WHERE user_id = ?",
        args: [userId],
      });
      const classes: Class[] = [];
      for (const row of rs.rows) {
        classes.push({
          id: row.id as string,
          university: row.university as string,
          department: row.department as string,
          courseNumber: row.course_number as string,
          name: row.name as string,
          description: row.description as string,
          userId: row.user_id as string,
          protection: row.protection as ProtectionLevel,
          createdAt: row.created_at as number,
        });
      }
      return classes;
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to fetch classes" };
    }
  },

  createClass: async (
    university: string,
    department: string,
    courseNumber: string,
    name: string,
    description: string,
    protection: ProtectionLevel,
    userId: string,
    classId = v4()
  ): Promise<TursoResponse<Class>> => {
    try {
      const currentTime = Date.now();
      const rs = await client.execute({
        sql: `
          INSERT INTO classes
            (id, university, department, course_number, name, description, user_id, protection, created_at)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          classId,
          university,
          department,
          courseNumber,
          name,
          description,
          userId,
          protection,
          currentTime,
        ],
      });
      if (rs.rowsAffected !== 1) {
        return { code: 500, message: "Failed to create class" };
      }
      return {
        id: classId,
        university,
        department,
        courseNumber,
        name,
        description,
        userId,
        protection,
        createdAt: currentTime,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to create class" };
    }
  },

  editClass: async (
    id: string,
    name: string,
    protection: ProtectionLevel
  ): Promise<TursoResponse<string>> => {
    try {
      const rs = await client.execute({
        sql: "UPDATE classes SET name = ?, protection = ? WHERE id = ?",
        args: [name, protection, id],
      });
      if (rs.rowsAffected === 0) {
        return { code: 404, message: "No class with this id" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to edit class" };
    }
  },

  deleteClass: async (id: string): Promise<TursoResponse<string>> => {
    try {
      const rs = await client.execute({
        sql: "DELETE FROM classes WHERE id = ?",
        args: [id],
      });
      if (rs.rowsAffected === 0) {
        return { code: 404, message: "No class with this id" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to delete class" };
    }
  },

  // Flashcards

  fetchFlashcards: async (
    classId: string,
    limit: number,
    offset: number
  ): Promise<TursoResponse<Flashcard[]>> => {
    try {
      const rs = await client.execute({
        sql: "SELECT * FROM flashcards WHERE class_id = ? LIMIT ? OFFSET ?",
        args: [classId, limit, offset],
      });
      const flashcards: Flashcard[] = [];
      for (const row of rs.rows) {
        flashcards.push({
          id: row.id as string,
          front: row.front as string,
          back: row.back as string,
          createdAt: row.created_at as number,
          updatedAt: row.updated_at as number,
          classId: row.class_id as string,
        });
      }
      return flashcards;
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to fetch flashcards" };
    }
  },

  createFlashcard: async (
    front: string,
    back: string,
    classId: string
  ): Promise<TursoResponse<Flashcard>> => {
    try {
      const id = v4();
      const currentTime = Date.now();
      const rs = await client.execute({
        sql: `
          INSERT INTO flashcards
            (id, front, back, created_at, updated_at, class_id)
          VALUES
            (?, ?, ?, ?, ?, ?)
        `,
        args: [id, front, back, currentTime, currentTime, classId],
      });
      if (rs.rowsAffected !== 1) {
        return { code: 500, message: "Failed to create flashcard" };
      }
      return {
        id,
        front,
        back,
        createdAt: currentTime,
        updatedAt: currentTime,
        classId,
      };
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to create flashcard" };
    }
  },

  createFlashcards: async (
    rawCards: UnsavedFlashcard[],
    classId: string
  ): Promise<TursoResponse<Flashcard[]>> => {
    try {
      const currentTime = Date.now();
      const flashcards = rawCards.map((c) => {
        return {
          ...c,
          createdAt: currentTime,
          updatedAt: currentTime,
          classId,
        };
      });
      const args = flashcards.map((c) => {
        return [c.id, c.front, c.back, c.createdAt, c.updatedAt, c.classId];
      });
      const sqlValues = args
        .map((a) => "(" + a.map((_) => "?").join(", ") + ")")
        .join(", ");
      const sql =
        `
        INSERT INTO flashcards
          (id, front, back, created_at, updated_at, class_id)
        VALUES
      ` + sqlValues;
      const rs = await client.execute({ sql, args: args.flatMap((a) => a) });
      if (rs.rowsAffected !== rawCards.length) {
        return { code: 500, message: "Failed to create flashcards" };
      }
      return flashcards;
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to create flashcards" };
    }
  },

  updateFlashcards: async (
    flashcards: UnsavedFlashcard[],
    classId: string
  ): Promise<TursoResponse<string>> => {
    try {
      const rs = await client.execute({
        sql: "SELECT id FROM flashcards WHERE class_id = ?",
        args: [classId],
      });
      const ids = rs.rows.map((r) => r.id as string);
      let existingCards: UnsavedFlashcard[] = [];
      let newCards: UnsavedFlashcard[] = [];
      for (const card of flashcards) {
        if (ids.includes(card.id)) {
          existingCards.push(card);
        } else {
          newCards.push(card);
        }
      }
      const currentTime = Date.now();
      const updates = existingCards.map((c) => {
        return {
          sql: "UPDATE flashcards SET front = ?, back = ?, updated_at = ? WHERE id = ?",
          args: [c.front, c.back, currentTime, c.id],
        };
      });
      const insertSql =
        newCards.length === 0
          ? `SELECT id FROM flashcards WHERE 1 = 0`
          : `
        INSERT INTO flashcards
          (id, front, back, created_at, updated_at, class_id)
        VALUES
          ${newCards.map((_) => `(?, ?, ?, ?, ?, ?)`).join(",\n")}
      `;
      const insertArgs =
        newCards.length === 0
          ? []
          : newCards.flatMap((c) => [
              c.id,
              c.front,
              c.back,
              currentTime,
              currentTime,
              classId,
            ]);
      const rs2 = await client.batch([
        { sql: insertSql, args: insertArgs },
        ...updates,
      ]);
      if (rs2.length !== 1 + updates.length) {
        return { code: 500, message: "Failed to update flashcards" };
      }
      if (rs2[0].rowsAffected !== newCards.length) {
        return { code: 500, message: "Failed to update existing flashcards" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to update flashcards" };
    }
  },

  deleteFlashcards: async (ids: string[]): Promise<TursoResponse<string>> => {
    try {
      const sqlValues = "(" + ids.map((_) => "?").join(", ") + ")";
      const sql = "DELETE FROM flashcards WHERE id IN " + sqlValues;
      const rs = await client.execute({ sql, args: ids });
      if (rs.rowsAffected !== ids.length) {
        return { code: 404, message: "Failed to delete flashcards" };
      }
      return "Success";
    } catch (error) {
      console.error(error);
      return { code: 500, message: "Failed to delete flashcards" };
    }
  },
};

export async function createTables() {
  try {
    const sql = `
DROP TABLE users;
DROP TABLE classes;
DROP TABLE flashcards;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  token TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  subscription_start INTEGER,
  subscription_end INTEGER
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  university TEXT NOT NULL,
  department TEXT NOT NULL,
  course_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  protection TEXT NOT NULL,
  user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  class_id TEXT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
`;
    return await client.executeMultiple(sql);
  } catch (error) {
    console.error(error);
  }
}
