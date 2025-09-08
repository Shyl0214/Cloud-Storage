import express from "express";
import { readdir, stat, mkdir } from "fs/promises";
import path from "path";

const router = express.Router();

const basePath = path.resolve("./storage");

// Read
router.get("/*?", async (req, res) => {
  const nestedPath = path.normalize(req.params[0] || "");
  const fullDirPath = path.join(`./storage`, nestedPath);

  try {
    const filesList = await readdir(fullDirPath);
    const resData = [];

    for (const item of filesList) {
      const stats = await stat(`${fullDirPath}/${item}`);
      resData.push({ name: item, isDirectory: stats.isDirectory() });
    }
    res.json(resData);
  } catch (err) {
    res.status(400).json({ message: "Directory not found" });
  }
});

//creating directory
router.post("/*", async (req, res) => {
  const nestedPath = path.normalize(req.params[0] || "");
  try {
    await mkdir(`./storage/${nestedPath}`, { recursive: true });
    res.json({ message: "Directory created successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Directory was not created", error: err.message });
  }
});

export default router;
