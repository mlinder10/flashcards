import { CSSProperties, ReactNode } from "react";
import styles from "./header.module.css";

type HeaderProps = {
  toolbarLeft?: ReactNode;
  title: string;
  toolbarRight?: ReactNode;
  style?: CSSProperties;
};

export default function Header({
  toolbarLeft = <span />,
  title,
  toolbarRight = <span />,
  style = undefined,
}: HeaderProps) {
  return (
    <header className={styles.header} style={style}>
      <div className={styles["toolbar-left"]}>{toolbarLeft}</div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles["toolbar-right"]}>{toolbarRight}</div>
    </header>
  );
}
