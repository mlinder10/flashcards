import styles from "./sidenav.module.css";
import { useState } from "react";
import { FaBars, FaHome, FaPlus } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Sidenav() {
  // get route
  const [isOpen, setIsOpen] = useState(checkStoredIsOpen());
  const baseRoute = window.location.pathname.split("/")[1];

  function toggleOpen() {
    setIsOpen(!isOpen);
    localStorage.setItem("isOpen", JSON.stringify(!isOpen));
  }

  function checkStoredIsOpen() {
    const storedIsOpen = localStorage.getItem("isOpen");
    if (storedIsOpen === null) return false;
    const parsedIsOpen = JSON.parse(storedIsOpen);
    if (parsedIsOpen === null) return false;
    return parsedIsOpen;
  }

  return (
    <nav className={styles.container}>
      <ul>
        <li>
          <button onClick={toggleOpen}>
            <FaBars />
          </button>
        </li>
        <li>
          <Link to="/" className={baseRoute === "" ? styles.active : ""}>
            <FaHome />
            {isOpen && <span>Home</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/create"
            className={baseRoute === "create" ? styles.active : ""}
          >
            <FaPlus />
            {isOpen && <span>Create</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/discover"
            className={baseRoute === "discover" ? styles.active : ""}
          >
            <FaMagnifyingGlass />
            {isOpen && <span>Discover</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
