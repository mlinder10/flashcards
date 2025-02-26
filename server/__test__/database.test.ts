import { isError, turso } from "../database";
import assert from "node:assert";
import { SUBSCRIPTIONS } from "../types";

// User
// TODO: test login with token, logout
const userId = "USERID";
const userName = "John Doe";
const userEmail = "jdoe@example.com";
const userPassword = "password123";

describe("register", () => {
  it("should create a user with specified name, email, and password", async () => {
    const res = await turso.register(userName, userEmail, userPassword, userId);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res.id, userId);
    assert.equal(res.name, userName);
    assert.equal(res.email, userEmail);
    assert.equal(res.subscriptionStart, undefined);
    assert.equal(res.subscriptionEnd, undefined);
    assert.notEqual(res.token, undefined);
  });
});

describe("login", () => {
  it("should login a user with specified email and password", async () => {
    const res = await turso.login(userEmail, userPassword);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res.id, userId);
    assert.equal(res.name, userName);
    assert.equal(res.email, userEmail);
    assert.equal(res.subscriptionStart, undefined);
    assert.equal(res.subscriptionEnd, undefined);
    assert.notEqual(res.token, undefined);
  });
});

describe("subscribe", () => {
  it("should subscribe a user with specified id", async () => {
    const subscription = SUBSCRIPTIONS.month;
    const res = await turso.subscribe(userId, subscription.duration);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res, "Success");
  });
});

// Class

const classId = "CLASSID";
const className = "Math";
const newClassName = "Physics";
const classProtection = "private";
const newClassProtection = "public";

describe("create class", () => {
  it("should create a class with specified name and protection", async () => {
    const res = await turso.createClass(
      className,
      classProtection,
      userId,
      classId
    );
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res.id, classId);
    assert.equal(res.name, className);
    assert.equal(res.userId, userId);
    assert.equal(res.protection, classProtection);
    assert.notEqual(res.createdAt, undefined);
  });
});

describe("fetch classes", () => {
  it("should fetch classes for a user with specified id", async () => {
    const res = await turso.fetchClasses(userId);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res.length, 1);
    assert.equal(res[0].id, classId);
    assert.equal(res[0].name, className);
    assert.equal(res[0].userId, userId);
    assert.equal(res[0].protection, classProtection);
    assert.notEqual(res[0].createdAt, undefined);
  });
});

describe("edit class", () => {
  it("should update a class with specified id", async () => {
    const res = await turso.editClass(
      classId,
      newClassName,
      newClassProtection
    );
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res, "Success");
  });
});

// Flashcards

const flashcards = [
  { id: "CARDID1", front: "Question 1", back: "Answer 1" },
  { id: "CARDID2", front: "Question 2", back: "Answer 2" },
];

describe("create flashcards", () => {
  it("should create flashcards for a class with specified id", async () => {
    const res = await turso.createFlashcards(flashcards, classId);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res.length, 2);
    assert.equal(res[0].id, flashcards[0].id);
    assert.equal(res[0].front, flashcards[0].front);
    assert.equal(res[0].back, flashcards[0].back);
    assert.equal(res[0].classId, classId);
    assert.equal(res[1].id, flashcards[1].id);
    assert.equal(res[1].front, flashcards[1].front);
    assert.equal(res[1].back, flashcards[1].back);
    assert.equal(res[1].classId, classId);
  });
});

describe("fetch flashcards", () => {
  it("should fetch flashcards for a class with specified id", async () => {
    const res = await turso.fetchFlashcards(classId, 10, 0);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res.length, 2);
    assert.equal(res[0].id, flashcards[0].id);
    assert.equal(res[0].front, flashcards[0].front);
    assert.equal(res[0].back, flashcards[0].back);
    assert.equal(res[0].classId, classId);
    assert.equal(res[1].id, flashcards[1].id);
    assert.equal(res[1].front, flashcards[1].front);
    assert.equal(res[1].back, flashcards[1].back);
    assert.equal(res[1].classId, classId);
  });
});

describe("edit flashcard", () => {
  it("should update a flashcard with specified id", async () => {
    const res = await turso.editFlashcard(
      flashcards[0].id,
      "New Question",
      "New Answer"
    );
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res, "Success");
  });
});

// Clean Up

describe("delete flashcards", () => {
  it("should delete flashcards for a class with specified id", async () => {
    const res = await turso.deleteFlashcards(flashcards.map((c) => c.id));
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res, "Success");
  });
});

describe("delete class", () => {
  it("should delete a class with specified id", async () => {
    const res = await turso.deleteClass(classId);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res, "Success");
  });
});

describe("delete user", () => {
  it("should delete a user with specified id", async () => {
    const res = await turso.deleteUser(userId);
    if (isError(res)) {
      throw new Error(res.message);
    }
    assert.equal(res, "Success");
  });
});
