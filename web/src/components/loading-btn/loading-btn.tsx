import styles from "./loadingbutton.module.css";
import { CSSProperties, ReactNode } from "react";
import { FaSpinner } from "react-icons/fa";

type LoadingButtonProps = {
  text: string;
  isLoading: boolean;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  styles: CSSProperties;
};

export default function LoadingButton({
  text,
  isLoading,
  onClick,
  icon,
  disabled,
  className,
  styles: s,
}: LoadingButtonProps) {
  <button
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`${className} ${styles.button}`}
    style={s}
  >
    {isLoading ? (
      <>
        <FaSpinner className={styles.spinner} />
        <span>Loading...</span>
      </>
    ) : (
      <>
        {icon && icon}
        <span>{text}</span>
      </>
    )}
  </button>;
}
