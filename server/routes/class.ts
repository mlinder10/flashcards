import { Router } from "express";
import { errorBoundary } from "../utils/middleware";
import { isError, turso } from "../database";

const router = Router();

router.get("/", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { id } = req.user;
    const classes = await turso.fetchClasses(id);
    if (isError(classes)) {
      return res.status(classes.code).json({ message: classes.message });
    }
    return res.status(200).json(classes);
  });
});

router.post("/create", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { name, protection } = req.body;
    if (!name || !protection) {
      return res.status(400).json({ message: "Missing class data" });
    }
    const class_ = await turso.createClass(name, protection, req.user.id);
    if (isError(class_)) {
      return res.status(class_.code).json({ message: class_.message });
    }
    return res.status(200).json(class_);
  });
});

router.patch("/edit", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { id, name, protection } = req.body;
    if (!id || !name || !protection) {
      return res.status(400).json({ message: "Missing class data" });
    }
    const class_ = await turso.editClass(id, name, protection);
    if (isError(class_)) {
      return res.status(class_.code).json({ message: class_.message });
    }
    return res.status(200).json(class_);
  });
});

router.delete("/:classId", async (req, res) => {
  errorBoundary(req, res, async (req, res) => {
    const { classId } = req.params;
    const response = await turso.deleteClass(classId);
    if (isError(response)) {
      return res.status(response.code).json({ message: response.message });
    }
    return res.status(200).json(response);
  });
});

export default router;
