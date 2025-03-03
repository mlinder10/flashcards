import { useContext, useState } from "react";
import styles from "./register.module.css";
import { AuthContext } from "../../contexts/AuthProvider";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className={styles.main}>
      <div>
        <h1>Register</h1>
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => register(name, email, password)}>
            Register
          </button>
          <p>
            <span>Already have an account?</span>
            <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </main>
  );
}
