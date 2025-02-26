import styles from "./class.module.css";
import { useParams } from "react-router-dom";
import { useQuery } from "../../hooks/api-call";
import { api } from "../../api";
import { useState } from "react";
import { Flashcard } from "../../types";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Class() {
  const { classId } = useParams();
  const flashcards = useQuery({
    initialData: [],
    query: async () => (await api.fetchFlashcards(classId as string)).data,
  });
  const [cardIndex, setCardIndex] = useState(0);
  const currentCard =
    flashcards.data.length > cardIndex ? flashcards.data[cardIndex] : null;

  return (
    <main>
      {currentCard && (
        <div>
          <FlashcardView flashcard={currentCard} />
          <button
            onClick={() => setCardIndex(cardIndex - 1)}
            disabled={cardIndex === 0}
            className={styles["back-btn"]}
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => setCardIndex(cardIndex + 1)}
            disabled={cardIndex === flashcards.data.length - 1}
            className={styles["next-btn"]}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </main>
  );
}

type FlashcardProps = {
  flashcard: Flashcard;
};

function FlashcardView({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div onClick={() => setIsFlipped(!isFlipped)} className="flashcard">
      <p>{isFlipped ? flashcard.back : flashcard.front}</p>
    </div>
  );
}
