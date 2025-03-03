import { ReactNode } from "react";
import styles from "./alert.module.css";

type AlertProps = {
  show: boolean;
  children: ReactNode;
};

export default function Alert({ show, children }: AlertProps) {
  if (!show) return null;

  return (
    <div className={styles.background}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
