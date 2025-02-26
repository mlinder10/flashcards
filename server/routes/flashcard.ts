import { Router } from "express";
import { errorBoundary, getLimitAndOffset } from "../utils/middleware";
import { isError, turso } from "../database";

const router = Router();

router.get("/:classId", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { classId } = req.params;
    const { limit, offset } = getLimitAndOffset(req);
    const flashcards = await turso.fetchFlashcards(classId, limit, offset);
    if (isError(flashcards)) {
      return res.status(flashcards.code).json({ message: flashcards.message });
    }
    return res.status(200).json(flashcards);
  });
});

router.post("/create", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { classId, rawFlashcards } = req.body;
    if (!classId) {
      return res.status(400).json({ message: "Missing classId" });
    }
    if (!rawFlashcards) {
      return res.status(400).json({ message: "Missing flashcards" });
    }
    const flashcards = await turso.createFlashcards(rawFlashcards, classId);
    if (isError(flashcards)) {
      return res.status(flashcards.code).json({ message: flashcards.message });
    }
    return res.status(200).json(flashcards);
  });
});

router.post("/create-one", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { classId, front, back } = req.body;
    if (!classId) {
      return res.status(400).json({ message: "Missing classId" });
    }
    if (!front || !back) {
      return res.status(400).json({ message: "Missing flashcard data" });
    }
    const flashcard = await turso.createFlashcard(front, back, classId);
    if (isError(flashcard)) {
      return res.status(flashcard.code).json({ message: flashcard.message });
    }
    return res.status(200).json(flashcard);
  });
});

router.patch("/edit", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { id, front, back } = req.body;
    if (!id || !front || !back) {
      return res.status(400).json({ message: "Missing flashcard data" });
    }
    const flashcards = await turso.editFlashcard(id, front, back);
    if (isError(flashcards)) {
      return res.status(flashcards.code).json({ message: flashcards.message });
    }
    return res.status(200).json(flashcards);
  });
});

router.post("/delete", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { cardIds } = req.body;
    if (!cardIds) {
      return res.status(400).json({ message: "Missing classId" });
    }
    const response = await turso.deleteFlashcards(cardIds);
    if (isError(response)) {
      return res.status(response.code).json({ message: response.message });
    }
    return res.status(200).json(response);
  });
});

export default router;
