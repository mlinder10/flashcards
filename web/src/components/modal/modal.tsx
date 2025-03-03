import Header from "../header/header";
import styles from "./modal.module.css";
import { ReactNode } from "react";
import { FaX } from "react-icons/fa6";

type ModalProps = {
  children: ReactNode;
  show: boolean;
  close: () => void;
  title?: string;
};

export default function Modal({
  children,
  show,
  close,
  title = "",
}: ModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <Header
          style={{ height: "60px", paddingInline: "1rem" }}
          title={title}
          toolbarLeft={
            <button onClick={close} style={{ backgroundColor: "transparent" }}>
              <FaX />
              <span>Close</span>
            </button>
          }
        />
        {children}
      </div>
    </div>
  );
}
