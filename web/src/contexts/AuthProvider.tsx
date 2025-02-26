import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, TOKEN_KEY } from "../api";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/spinner/spinner";
import { User } from "../types";

const defaultAuthContext = {
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  quietLogin: async () => {},
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | void>;
  logout: () => void;
  quietLogin: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function login(email: string, password: string) {
    try {
      const res = await api.login(email, password);
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data);
      }
    } catch (err: any) {
      console.error(err);
      return err.response.data.message;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const res = await api.register(name, email, password);
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        setUser(res.data);
      }
    } catch (err: any) {
      console.error(err);
      return err.response.data.message;
    } finally {
      setIsLoading(false);
    }
  }

  async function quietLogin() {
    setIsLoading(true);
    try {
      const res = await api.quietLogin();
      setUser(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, quietLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, quietLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      quietLogin().catch(() => navigate("/login"));
    }
  }, [user]);

  if (isLoading) {
    return <Spinner />;
  }

  return children;
}

type AuthRouteProps = {
  children: ReactNode;
};

export function AuthRoute({ children }: AuthRouteProps) {
  const { user, isLoading, quietLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    } else {
      quietLogin().then(() => navigate("/"));
    }
  }, [user]);

  if (isLoading) {
    return <Spinner />;
  }

  return children;
}
