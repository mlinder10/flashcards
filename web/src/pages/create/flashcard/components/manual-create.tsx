import styles from "./manualcreate.module.css";
import { api } from "../../../../api";
import { useMutation, useQuery } from "../../../../hooks/api-call";
import { UnsavedFlashcard } from "../../../../types";
import { useEffect, useState } from "react";
import Spinner from "../../../../components/spinner/spinner";
import { FaPlus, FaSave, FaTrash } from "react-icons/fa";
import { v4 } from "uuid";
import { VscCircleSlash } from "react-icons/vsc";
import { exportToCSV } from "../../../../helpers";

type ManualCreateViewProps = {
  classId: string;
};

const CARD_LIMIT = 32;

export default function ManualCreateView({ classId }: ManualCreateViewProps) {
  const [offsetIndex, setOffsetIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const flashcards = useQuery<UnsavedFlashcard[]>({
    initialData: [],
    query: async () => {
      const res = await api.fetchFlashcards(
        classId,
        CARD_LIMIT,
        offsetIndex * CARD_LIMIT
      );
      setHasMore(res.data.length === CARD_LIMIT);
      return res.data;
    },
    callOnMount: false,
  });
  const [changed, setChanged] = useState<UnsavedFlashcard[]>([]);
  const saveCards = useMutation({
    mutation: async () => (await api.updateFlashcards(changed, classId)).data,
  });

  function updateFlashcard(id: string, text: string, side: "front" | "back") {
    if (!changed.find((c) => c.id === id)) {
      let newCard = flashcards.data.find((c) => c.id === id);
      if (!newCard) return;
      const copy = { ...newCard };
      copy[side] = text;
      setChanged((prev) => [...prev, copy]);
    } else {
      let copy = [...changed];
      const index = copy.findIndex((c) => c.id === id);
      if (index === -1) return;
      copy[index][side] = text;
      setChanged(copy);
    }
  }

  function handleAdd() {
    setChanged((prev) => [...prev, { id: v4(), front: "", back: "" }]);
  }

  function handleDiscard(id?: string) {
    if (id) {
      setChanged((prev) => prev.filter((c) => c.id !== id));
    } else {
      setChanged([]);
    }
  }

  async function handleSaveAll() {
    const res = await saveCards.mutate();
    if (res === null) return;
    const newList = getMergedFlashcards().map((c) => getFlashcard(c.id));
    flashcards.setData(newList);
    setChanged([]);
  }

  function handleSave(flashcard: UnsavedFlashcard) {
    const index = changed.findIndex((c) => c.id === flashcard.id);
    if (index === -1) {
      flashcards.setData((prev) => [...prev, flashcard]);
    } else {
      let copy = [...flashcards.data];
      copy[index] = flashcard;
      flashcards.setData(copy);
    }
    setChanged((prev) => prev.filter((c) => c.id !== flashcard.id));
  }

  function handleDelete(id: string) {
    flashcards.setData((prev) => prev.filter((c) => c.id !== id));
  }

  function getFlashcard(id: string) {
    return {
      ...(changed.find((c) => c.id === id) ||
        flashcards.data.find((c) => c.id === id)!),
      changed: changed.find((c) => c.id === id) !== undefined,
    };
  }

  function getMergedFlashcards() {
    const changeExclusive = changed.filter(
      (c) => !flashcards.data.find((f) => f.id === c.id)
    );
    let total: UnsavedFlashcard[] = [...flashcards.data];
    for (const c of changeExclusive) {
      total.unshift(c);
    }
    return total;
  }

  useEffect(() => {
    async function fetchMoreFlashcards() {
      const res = await flashcards.fetchDataWithoutMutation();
      if (!res) return;
      flashcards.setData((prev) => [...prev, ...res]);
    }
    fetchMoreFlashcards();
  }, [offsetIndex]);

  function handleExport() {
    exportToCSV(flashcards.data);
  }

  return (
    <div className={styles.container}>
      <div className={styles["action-btn-container"]}>
        <button onClick={handleExport}></button>
        <button onClick={handleAdd} className={styles["add-btn"]}>
          <FaPlus />
          <span>Add</span>
        </button>
        <button
          onClick={handleSaveAll}
          disabled={changed.length === 0}
          className={styles["save-btn"]}
        >
          <FaSave />
          <span>Save All</span>
        </button>
        <button
          onClick={() => handleDiscard()}
          disabled={changed.length === 0}
          className={styles["discard-btn"]}
        >
          <VscCircleSlash />
          <span>Discard All</span>
        </button>
      </div>
      <div className={styles.grid}>
        {getMergedFlashcards()
          .map((f) => getFlashcard(f.id))
          .map((f) => (
            <FlashcardView
              key={f.id}
              flashcard={f}
              classId={classId}
              updateFlashcard={updateFlashcard}
              handleDiscard={handleDiscard}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
      </div>
      {flashcards.loading && <Spinner />}
      {hasMore && !flashcards.loading && (
        <button
          onClick={() => setOffsetIndex((prev) => prev + 1)}
          className={styles["load-more-btn"]}
        >
          Load More
        </button>
      )}
    </div>
  );
}

type FlashcardViewProps = {
  flashcard: UnsavedFlashcard & { changed: boolean };
  classId: string;
  updateFlashcard: (id: string, text: string, side: "front" | "back") => void;
  handleDiscard: (id?: string) => void;
  onSave: (flashcard: UnsavedFlashcard) => void;
  onDelete: (id: string) => void;
};

function FlashcardView({
  flashcard,
  classId,
  updateFlashcard,
  handleDiscard,
  onSave,
  onDelete,
}: FlashcardViewProps) {
  const saveCard = useMutation({
    mutation: async () =>
      (await api.updateFlashcards([flashcard], classId)).data,
  });
  const deleteCard = useMutation({
    mutation: async () => (await api.deleteFlashcards([flashcard.id])).data,
  });

  async function handleSave() {
    await saveCard.mutate();
    onSave(flashcard);
  }

  async function handleDelete() {
    await deleteCard.mutate();
    handleDiscard();
    onDelete(flashcard.id);
  }

  return (
    <div
      key={flashcard.id}
      className={`${styles.card} ${flashcard.changed ? styles.changed : ""}`}
    >
      <div className={styles["card-action-btn-container"]}>
        <button
          onClick={handleSave}
          disabled={!flashcard.changed}
          className={styles["save-btn"]}
        >
          <FaSave />
        </button>
        <button
          onClick={() => handleDiscard(flashcard.id)}
          disabled={!flashcard.changed}
          className={styles["discard-btn"]}
        >
          <VscCircleSlash />
        </button>
        <button onClick={handleDelete} className={styles["delete-btn"]}>
          <FaTrash />
        </button>
      </div>
      <textarea
        placeholder="Front"
        value={flashcard.front}
        onChange={(e) => updateFlashcard(flashcard.id, e.target.value, "front")}
      />
      <textarea
        placeholder="Back"
        value={flashcard.back}
        onChange={(e) => updateFlashcard(flashcard.id, e.target.value, "back")}
      />
    </div>
  );
}
