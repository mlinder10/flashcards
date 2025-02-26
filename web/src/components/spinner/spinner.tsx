import { FaSpinner } from "react-icons/fa";
import styles from "./spinner.module.css";

export default function Spinner() {
  return (
    <div className={styles.container}>
      <FaSpinner className={styles.spinner} />
    </div>
  );
}
