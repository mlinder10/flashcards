import { useContext, useState } from "react";
import styles from "./login.module.css";
import { AuthContext } from "../../contexts/AuthProvider";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className={styles.main}>
      <div>
        <h1>Login</h1>
        <div>
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
          <button onClick={() => login(email, password)}>Login</button>
          <p>
            <span>Don't have an account?</span>
            <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </main>
  );
}
