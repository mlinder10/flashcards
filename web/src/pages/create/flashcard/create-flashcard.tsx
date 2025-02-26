import { useState } from "react";
import { FaArrowsRotate } from "react-icons/fa6";
import { GenerateType, RawFlashcard } from "../../../types";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "../../../hooks/api-call";
import { api } from "../../../api";
import { FaChevronLeft, FaChevronRight, FaPlus, FaSave } from "react-icons/fa";
import Alert from "../../../components/alert/alert";

export default function CreateFlashcard() {
  const { classId } = useParams();
  const [createType, setCreateType] = useState<"manual" | "ai">("ai");

  return (
    <main>
      <div>
        <div>
          <button onClick={() => setCreateType("manual")}>Manual</button>
          <button onClick={() => setCreateType("ai")}>AI</button>
        </div>
        {createType === "manual" && (
          <ManualCreateView classId={classId as string} />
        )}
        {createType === "ai" && <AICreateView />}
      </div>
    </main>
  );
}

type ManualCreateViewProps = {
  classId: string;
};

function ManualCreateView({ classId }: ManualCreateViewProps) {
  const flashcards = useQuery<RawFlashcard[]>({
    initialData: [],
    query: async () => (await api.fetchFlashcards(classId)).data,
  });
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const validIndex = cardIndex < flashcards.data.length && cardIndex >= 0;
  const currentCard = validIndex ? flashcards.data[cardIndex] : null;
  const save = useMutation({
    mutation: async (front, back) =>
      (await api.saveFlashcard(front, back, classId)).data,
  });

  function setFront(front: string) {
    if (!validIndex) return;
    let copy = [...flashcards.data];
    copy[cardIndex].front = front;
    flashcards.setData(copy);
    setHasChanges(true);
  }

  function setBack(back: string) {
    if (!validIndex) return;
    let copy = [...flashcards.data];
    copy[cardIndex].back = back;
    flashcards.setData(copy);
    setHasChanges(true);
  }

  function handleAdd() {
    if (hasChanges) {
      // TODO: tell user they have unsaved changes
      return;
    }
    let copy = [...flashcards.data];
    copy.push({ front: "", back: "" });
    flashcards.setData(copy);
    setCardIndex(flashcards.data.length);
    setHasChanges(true);
  }

  function handlePrev() {
    if (flashcards.data.length === 0 || cardIndex === 0) {
      return;
    }
    if (hasChanges) {
      // TODO: tell user they have unsaved changes
      return;
    }
    setCardIndex((prev) => prev - 1);
  }

  function handleNext() {
    if (
      flashcards.data.length === 0 ||
      cardIndex === flashcards.data.length - 1
    ) {
      return;
    }
    if (hasChanges) {
      // TODO: tell user they have unsaved changes
      return;
    }
    setCardIndex((prev) => prev + 1);
  }

  async function handleSave() {
    if (currentCard === null || !hasChanges) {
      return;
    }
    await save.mutate(currentCard.front, currentCard.back);
    setHasChanges(false);
  }

  return (
    <div>
      {currentCard && (
        <div>
          <p>
            {cardIndex + 1} / {flashcards.data.length}
          </p>
          <div>
            {!isFlipped ? (
              <input
                type="text"
                value={currentCard.front}
                onChange={(e) => setFront(e.target.value)}
              />
            ) : (
              <input
                type="text"
                value={currentCard.back}
                onChange={(e) => setBack(e.target.value)}
              />
            )}
            <button onClick={() => setIsFlipped(!isFlipped)}>
              <FaArrowsRotate />
            </button>
          </div>
        </div>
      )}
      <div>
        <button onClick={handlePrev} disabled={cardIndex === 0}>
          <FaChevronLeft />
        </button>
        <button onClick={handleAdd}>
          <FaPlus />
          <span>Add Card</span>
        </button>
        <button onClick={handleSave} disabled={!hasChanges}>
          <FaSave />
          <span>Save Card</span>
        </button>
        <button
          onClick={handleNext}
          disabled={
            cardIndex === flashcards.data.length - 1 ||
            flashcards.data.length === 0
          }
        >
          <FaChevronRight />
        </button>
      </div>
      <Alert show={showAlert}>
        <div>
          <p>
            You have unsaved changes, are you sure you want to discard this
            flashcard?
          </p>
          <div>
            <button>Discard</button>
            <button>Cancel</button>
          </div>
        </div>
      </Alert>
    </div>
  );
}

function AICreateView() {
  const [createType, setCreateType] = useState<GenerateType>("notes");
  const [notes, setNotes] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [courseName, setCourseName] = useState("");
  const [university, setUniversity] = useState("");
  const [level, setLevel] = useState("");

  async function handleGenerate() {}

  return (
    <div>
      <div>
        {createType === "notes" && (
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        )}
        {createType === "syllabus" && (
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
          />
        )}
        {createType === "courseInfo" && (
          <div>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>
        )}
      </div>
      <div>
        <button onClick={() => setCreateType("syllabus")}>Syllabus</button>
        <button onClick={() => setCreateType("notes")}>Notes</button>
        <button onClick={() => setCreateType("courseInfo")}>
          Course Information
        </button>
        <button onClick={handleGenerate}>Generate</button>
      </div>
    </div>
  );
}
