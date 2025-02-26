import express, { Router } from "express";
import cors from "cors";
import { generateFlashcardsFromSyllabus } from "../gemini";
import authRouter from "../routes/auth";
import classRouter from "../routes/class";
import flashcardRouter from "../routes/flashcard";
import { authenticate } from "../utils/middleware";

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
  try {
    const { syllabus } = req.body;
    const flashcards = await generateFlashcardsFromSyllabus(syllabus);
    res.json(flashcards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
