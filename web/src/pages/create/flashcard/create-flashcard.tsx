import styles from "./createflashcard.module.css";
import { useState } from "react";
import { useParams } from "react-router-dom";
import AICreateView from "./components/ai-create";
import ManualCreateView from "./components/manual-create";

export default function CreateFlashcard() {
  const { classId } = useParams();
  const [createType, setCreateType] = useState<"manual" | "ai">("ai");

  return (
    <main className={styles.main}>
      <h1>Create Flashcards</h1>
      <div className={styles.container}>
        <div className={styles["create-type-container"]}>
          <button
            onClick={() => setCreateType("ai")}
            className={createType === "ai" ? styles.active : ""}
          >
            Generative AI
          </button>
          <button
            onClick={() => setCreateType("manual")}
            className={createType === "manual" ? styles.active : ""}
          >
            Manual
          </button>
        </div>
        {createType === "manual" && (
          <ManualCreateView classId={classId as string} />
        )}
        {createType === "ai" && <AICreateView classId={classId as string} />}
      </div>
    </main>
  );
}
