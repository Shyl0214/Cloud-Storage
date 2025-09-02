import express from "express";
import { createWriteStream } from "fs";
import { readdir, rm, rename } from "fs/promises";

const app = express();

app.disable("x-powered-by");

app.use(express.json());

// Enabling Cors
app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
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
// get
app.get("/:fileName", (req, res) => {
  console.log(req.query);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  const { fileName } = req.params;
  console.log({ fileName });
  res.sendFile(`${import.meta.dirname}/storage/${fileName}`);
});

// upload
app.post("/:fileName", (req, res) => {
  console.log(req.params.fileName);
  const { fileName } = req.params;
  const writeStream = createWriteStream(`./storage/${req.params.fileName}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File uploaded successfully" });
  });
});

//update
app.patch("/:fileName", async (req, res) => {
  const { fileName } = req.params;
  console.log(fileName);
  console.log(req.body.newFilename);
  try {
    await rename(`./storage/${fileName}`, `./storage/${req.body.newFilename}`);
    res.json({ message: "Renamed successfully" });
  } catch (err) {
    res.status(404).json({ message: "Error renaming file" });
  }
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
