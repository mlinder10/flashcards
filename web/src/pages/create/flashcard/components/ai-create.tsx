import styles from "./aicreate.module.css";
import { useState, useEffect } from "react";
import { api } from "../../../../api";
import { useMutation, useQuery } from "../../../../hooks/api-call";
import { GenerateType, UnsavedFlashcard } from "../../../../types";
import Spinner from "../../../../components/spinner/spinner";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaSave,
  FaCircle,
  FaTrash,
} from "react-icons/fa";

type AICreateViewProps = {
  classId: string;
};

export default function AICreateView({ classId }: AICreateViewProps) {
  const [flashcards, setFlashcards] = useState<UnsavedFlashcard[]>([]);

  return (
    <>
      {flashcards.length === 0 ? (
        <Prompt onFetch={setFlashcards} />
      ) : (
        <FlashcardsGrid
          flashcards={flashcards}
          classId={classId}
          updateFlashcards={setFlashcards}
        />
      )}
    </>
  );
}

type PromptProps = {
  onFetch: (flashcards: UnsavedFlashcard[]) => void;
};

function Prompt({ onFetch }: PromptProps) {
  const [createType, setCreateType] = useState<GenerateType>("syllabus");
  const [notes, setNotes] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [courseName, setCourseName] = useState("");
  const [university, setUniversity] = useState("");
  const [level, setLevel] = useState("");
  const flashcards = useQuery<UnsavedFlashcard[]>({
    initialData: [],
    callOnMount: false,
    query: async () => {
      switch (createType) {
        case "notes":
          return (await api.generateFlashcardsFromNotes(notes)).data;
        case "syllabus":
          return (await api.generateFlashcardsFromSyllabus(syllabus)).data;
        case "courseInfo":
          return (
            await api.generateFlashcardsFromCourseInfo(
              courseName,
              university,
              level
            )
          ).data;
      }
    },
  });

  const canGenerate = () => {
    switch (createType) {
      case "notes":
        return notes.length > 0;
      case "syllabus":
        return syllabus.length > 0;
      case "courseInfo":
        return (
          courseName.length > 0 && university.length > 0 && level.length > 0
        );
    }
  };

  useEffect(() => {
    if (flashcards.data.length > 0) {
      onFetch(flashcards.data);
    }
  }, [flashcards.data]);

  if (flashcards.loading) {
    return (
      <div className={styles["loading-container"]}>
        <div>
          <p>Generating...</p>
          <p>This may take up to a minute</p>
          <Spinner size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles["prompt-container"]}>
      <div className={styles["ai-btns-container"]}>
        <button
          onClick={() => setCreateType("syllabus")}
          className={createType === "syllabus" ? styles.active : ""}
        >
          Syllabus
        </button>
        <button
          onClick={() => setCreateType("notes")}
          className={createType === "notes" ? styles.active : ""}
        >
          Notes
        </button>
        <button
          onClick={() => setCreateType("courseInfo")}
          className={createType === "courseInfo" ? styles.active : ""}
        >
          Course Information
        </button>
        <button
          onClick={flashcards.fetchData}
          className={styles["generate-btn"]}
          disabled={!canGenerate()}
        >
          <span>Generate</span>
          <FaArrowRight />
        </button>
      </div>
      <div className={styles["input-container"]}>
        {createType === "notes" && (
          <div className={styles["notes-container"]}>
            <p className={styles.subtitle}>Enter Your Course Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
        {createType === "syllabus" && (
          <div className={styles["syllabus-container"]}>
            <p className={styles.subtitle}>Enter Your Course Syllabus</p>
            <textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
            />
          </div>
        )}
        {createType === "courseInfo" && (
          <div className={styles["course-info-container"]}>
            <div>
              <p className={styles.subtitle}>Enter Your Course Information</p>
              <input
                type="text"
                placeholder="PSYC 101"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
              <input
                type="text"
                placeholder="University of South Carolina"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
              <input
                type="text"
                placeholder="Undergraduate"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type FlashcardsGridProps = {
  flashcards: UnsavedFlashcard[];
  classId: string;
  updateFlashcards: (flashcards: UnsavedFlashcard[]) => void;
};

function FlashcardsGrid({
  flashcards,
  classId,
  updateFlashcards,
}: FlashcardsGridProps) {
  const [selected, setSelected] = useState<UnsavedFlashcard[]>([]);
  const save = useMutation({
    mutation: async () => (await api.saveFlashcards(selected, classId)).data,
  });

  async function handleSave() {
    await save.mutate();
    handleDelete();
  }

  function handleDelete() {
    const copy = flashcards.filter((f) => !selected.includes(f));
    setSelected([]);
    updateFlashcards(copy);
  }

  function toggleSelect(flashcard: UnsavedFlashcard) {
    if (selected.includes(flashcard)) {
      setSelected(selected.filter((f) => f !== flashcard));
    } else {
      setSelected([...selected, flashcard]);
    }
  }

  function toggleSelectAll() {
    if (selected.length === flashcards.length) {
      setSelected([]);
    } else {
      setSelected(flashcards);
    }
  }

  return (
    <div className={styles["grid-container"]}>
      <div className={styles["grid-subheader"]}>
        <button onClick={() => updateFlashcards([])}>
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className={styles["grid-subheader-right"]}>
          <button onClick={toggleSelectAll} className={styles["select-btn"]}>
            {selected.length === flashcards.length ? (
              <FaCheckCircle />
            ) : (
              <FaCircle />
            )}
            <span>
              {selected.length} / {flashcards.length}
            </span>
            {selected.length === flashcards.length ? (
              <span>Unselect All</span>
            ) : (
              <span>Select All</span>
            )}
          </button>
          <button
            disabled={selected.length === 0}
            onClick={handleSave}
            className={styles["save-btn"]}
          >
            <FaSave />
            <span>Save</span>
          </button>
          <button
            disabled={selected.length === 0}
            onClick={handleDelete}
            className={styles["delete-btn"]}
          >
            <FaTrash />
            <span>Delete</span>
          </button>
        </div>
      </div>
      <div className={styles.grid}>
        {flashcards.map((flashcard) => (
          <div
            key={flashcard.front}
            className={`${styles["ai-card"]} ${
              selected.includes(flashcard) ? styles.selected : ""
            }`}
            onClick={() => toggleSelect(flashcard)}
            data-testid={`flashcard-${flashcard.front}`}
          >
            <p>{flashcard.front}</p>
            <p>{flashcard.back}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
