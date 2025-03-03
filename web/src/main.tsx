import "./index.css";
import { JSX } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/auth/login.tsx";
import Register from "./pages/auth/register.tsx";
import AuthProvider, {
  AuthRoute,
  ProtectedRoute,
} from "./contexts/AuthProvider.tsx";
import Home from "./pages/home/home.tsx";
import Sidenav from "./components/sidenav/sidenav.tsx";
import Class from "./pages/class/class.tsx";
import Create from "./pages/create/create.tsx";
import CreateFlashcard from "./pages/create/flashcard/create-flashcard.tsx";

type Route = {
  path: string;
  element: JSX.Element;
  isProtected: boolean | null;
  showsNavbar: boolean;
};

const routes: Route[] = [
  {
    path: "/login",
    element: <Login />,
    isProtected: false,
    showsNavbar: false,
  },
  {
    path: "/register",
    element: <Register />,
    isProtected: false,
    showsNavbar: false,
  },
  {
    path: "/",
    element: <Home />,
    isProtected: null,
    showsNavbar: false,
  },
  {
    path: "/create",
    element: <Create />,
    isProtected: true,
    showsNavbar: true,
  },
  {
    path: "/class/:classId",
    element: <Class />,
    isProtected: true,
    showsNavbar: true,
  },
  {
    path: "/create/:classId",
    element: <CreateFlashcard />,
    isProtected: true,
    showsNavbar: true,
  },
];

const router = createBrowserRouter(
  routes.map((route) => {
    let element;
    if (route.isProtected === true) {
      element = (
        <ProtectedRoute>
          {route.showsNavbar && <Sidenav />}
          {route.element}
        </ProtectedRoute>
      );
    } else if (route.isProtected === false) {
      element = (
        <AuthRoute>
          {route.showsNavbar && <Sidenav />}
          {route.element}
        </AuthRoute>
      );
    } else {
      element = (
        <>
          {route.showsNavbar && <Sidenav />}
          {route.element}
        </>
      );
    }
    return {
      path: route.path,
      element,
    };
  })
);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);
