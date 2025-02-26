import styles from "./sidenav.module.css";
import { useState } from "react";
import { FaBars, FaHome, FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Sidenav() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <nav className={styles.container}>
      <ul>
        <li>
          <button onClick={() => setIsOpen(!isOpen)}>
            <FaBars />
          </button>
          <a href="/">Logo</a>
        </li>
        <li>
          <Link to="/">
            <FaHome />
            {isOpen && <span>Home</span>}
          </Link>
        </li>
        <li>
          <Link to="/create">
            <FaPlus />
            {isOpen && <span>Create</span>}
          </Link>
        </li>
        <li>
          <Link to="/discover">
            <FaMagnifyingGlass />
            {isOpen && <span>Discover</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
