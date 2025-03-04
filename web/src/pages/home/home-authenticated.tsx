import styles from "./homeauthenticated.module.css";
import { useQuery } from "../../hooks/api-call";
import { api } from "../../api";
import Sidenav from "../../components/sidenav/sidenav";
import { Link } from "react-router-dom";

export default function HomeAuthenticated() {
  const classes = useQuery({
    initialData: [],
    query: async () => (await api.fetchClasses()).data,
  });

  return (
    <>
      <Sidenav />
      <main className={styles.main}>
        <h1>Your Classes</h1>
        <ul>
          {classes.data.map((c) => (
            <li key={c.id}>
              <Link to={`/class/${c.id}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
