import express, { Router } from "express";
import cors from "cors";
import { gemini } from "../gemini";
import authRouter from "../routes/auth";
import classRouter from "../routes/class";
import flashcardRouter from "../routes/flashcard";
import { authenticate, errorBoundary } from "../utils/middleware";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use("/auth", authRouter);
const protectedRoutes = Router();
protectedRoutes.use(authenticate);
app.use("/protected", protectedRoutes);
protectedRoutes.use("/class", classRouter);
protectedRoutes.use("/flashcard", flashcardRouter);

protectedRoutes.post("/generate", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { type, notes, syllabus, courseInfo } = req.body;
    const flashcards = await gemini.generate(type, notes, syllabus, courseInfo);
    return res.status(200).json(flashcards);
  });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
