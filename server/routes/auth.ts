import { Router } from "express";
import { isError, turso } from "../database";
import { errorBoundary, getToken } from "../utils/middleware";

const router = Router();

router.post("/login", async (req, res: any) => {
  errorBoundary(req, res, async (req, res) => {
    const { email, password } = req.body;
    const user = await turso.login(email, password);
    if (isError(user)) {
      return res.status(user.code).json({ message: user.message });
    }
    return res.status(200).json(user);
  });
});

router.get("/login", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await turso.loginWithToken(token);
    if (isError(user)) {
      return res.status(user.code).json({ message: user.message });
    }
    return res.status(200).json(user);
  });
});

router.post("/register", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { name, email, password } = req.body;
    const user = await turso.register(name, email, password);
    if (isError(user)) {
      return res.status(user.code).json({ message: user.message });
    }
    return res.status(200).json(user);
  });
});

router.delete("/logout", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await turso.logout(token);
    if (isError(user)) {
      return res.status(user.code).json({ message: user.message });
    }
    return res.status(200).json(user);
  });
});

export default router;
