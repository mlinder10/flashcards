import { FaSpinner } from "react-icons/fa";
import styles from "./spinner.module.css";

type SpinnerProps = {
  size?: number;
};

export default function Spinner({ size }: SpinnerProps) {
  return (
    <div className={styles.container}>
      <FaSpinner className={styles.spinner} style={{ fontSize: size }} />
    </div>
  );
}
