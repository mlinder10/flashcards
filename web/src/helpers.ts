import { UnsavedFlashcard } from "./types";

export function exportToCSV(flashcards: UnsavedFlashcard[]) {
  const csv = flashcards.map((f) => `${f.front};${f.back}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flashcards.csv";
  link.click();
}
