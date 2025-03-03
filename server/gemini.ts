import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import {
  CourseInfo,
  Flashcard,
  GenerateType,
  RawFlashcard,
  UnsavedFlashcard,
} from "./types";
import { v4 } from "uuid";
config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const gemini = {
  generate: async (
    generateType: GenerateType,
    notes?: string,
    syllabus?: string,
    courseInfo?: CourseInfo
  ): Promise<UnsavedFlashcard[]> => {
    let res: RawFlashcard[] = [];
    switch (generateType) {
      case "notes":
        res = await generateFlashcardsFromNotes(notes ?? "");
        break;
      case "syllabus":
        res = await generateFlashcardsFromSyllabus(syllabus ?? "");
        break;
      case "courseInfo":
        res = await generateFlashcardsFromCourseInfo(
          courseInfo?.courseName ?? "",
          courseInfo?.university ?? "",
          courseInfo?.level ?? ""
        );
    }
    return res.map((c) => {
      return { ...c, id: v4() };
    });
  },
};

const syllabusPrompt = `
        I'm going to send you a course syllabus.
        I'd like you to generate flashcards to teach the course material.
        Please respond in the following json format: [{ front: string, back: string }].
        Your response string should not include any markdown formatting.
        Please be sure to generate flashcards related to the course content, not the course syllabus.
        You will need to use external resources and hypothesize the specifics of the course.
        
        Course Syllabus:
        
        `;

async function generateFlashcardsFromSyllabus(
  syllabus: string
): Promise<RawFlashcard[]> {
  try {
    const result = await model.generateContent(syllabusPrompt + syllabus);
    const output = removeFormatting(result.response.text());
    const json = JSON.parse(output);
    return json as RawFlashcard[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

const notesPrompt = `
        I'm going to send you my notes from a course.
        I'd like you to generate flashcards to teach the course material.
        Please respond in the following json format: [{ front: string, back: string }].
        Your response string should not include any markdown formatting.
        
        Notes:
        
        `;

async function generateFlashcardsFromNotes(
  notes: string
): Promise<RawFlashcard[]> {
  try {
    const result = await model.generateContent(notesPrompt + notes);
    const output = removeFormatting(result.response.text());
    const json = JSON.parse(output);
    return json as RawFlashcard[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

const courseInfoPrompt = (
  courseName: string,
  university: string,
  level: string
) => ``;

async function generateFlashcardsFromCourseInfo(
  courseName: string,
  university: string,
  level: string
): Promise<RawFlashcard[]> {
  try {
    const result = await model.generateContent(
      courseInfoPrompt(courseName, university, level)
    );
    const output = removeFormatting(result.response.text());
    const json = JSON.parse(output);
    return json as RawFlashcard[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function removeFormatting(input: string) {
  return input.slice(8, input.length - 3);
}
