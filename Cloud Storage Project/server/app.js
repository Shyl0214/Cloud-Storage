import { error } from "console";
import express from "express";
import { readdir, rm } from "fs/promises";

const app = express();

app.disable("x-powered-by");

app.use(express.json());

// Enabling Cors
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  });
  next();
});

// this will server the static files
const serveStatic = express.static("storage");

// serving dir content
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  res.json(filesList);
});

// dynamic routing
app.get("/:fileName", (req, res) => {
  console.log(req.query);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  const { fileName } = req.params;
  console.log({ fileName });
  res.sendFile(`${import.meta.dirname}/storage/${fileName}`);
});

// delete
app.delete("/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const filePath = `./storage/${fileName}`;
  console.log(filePath);
  try {
    // throw new error();
    await rm(filePath);
    res.json({ message: "File delete successfully" });
  } catch (err) {
    res.status(404).json({ message: "File not found" });
  }
});

app.listen(4000, (req, res) => {
  console.log("Server started");
});
