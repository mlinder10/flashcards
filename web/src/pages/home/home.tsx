import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthProvider";
import HomeAuthenticated from "./home-authenticated";

export default function Home() {
  const { user } = useContext(AuthContext);

  if (user) {
    return <HomeAuthenticated />;
  }

  return (
    <main>
      <h1>Home</h1>
    </main>
  );
}
