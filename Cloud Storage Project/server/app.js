import express from "express";
import { createWriteStream } from "fs";
import { readdir, rm, rename, stat, mkdir } from "fs/promises";
import cors from "cors";

const app = express();

app.disable("x-powered-by");

app.use(express.json());

app.use(cors());

// this will server the static files
const serveStatic = express.static("storage");

// serving dir content
// Read
app.get("/directory/*?", async (req, res) => {
  const nestedPath = req.params[0] || ""; // multiple level nested dir support
  // console.log("nested-path", nestedPath);
  const fullDirPath = `./storage/${nestedPath}`;
  const filesList = await readdir(fullDirPath);
  const resData = [];
  for (const item of filesList) {
    const stats = await stat(`${fullDirPath}/${item}`);
    resData.push({ name: item, isDirectory: stats.isDirectory() });
  }
  res.json(resData);
});

//creating directory
app.post("/directory/*", async (req, res) => {
  const nestedPath = req.params[0] || "";
  try {
    await mkdir(`./storage/${nestedPath}`, { recursive: true });
    res.json({ message: "Directory created successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Directory was not created", error: err.message });
  }
});

// dynamic routing
app.get("/files/*", (req, res) => {
  let nestedPath = req.params[0] || ""; // multi level nested file support
  // console.log("Nested-Path : ", nestedPath);

  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/storage/${nestedPath}`);
});

// upload
app.post("/files/*", (req, res) => {
  // console.log(req.params.fileName);
  // const { fileName } = req.params;
  const nestedPath = req.params[0] || "";
  console.log("upload", nestedPath);
  const writeStream = createWriteStream(`./storage/${nestedPath}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File uploaded successfully" });
  });
});

//update
app.patch("/files/*", async (req, res) => {
  const nestedPath = req.params[0] || "";
  console.log(req.body);
  let newName = req.body.newFilename;

  // remove leading slashes to keep it relative
  if (newName.startsWith("/")) {
    newName = newName.slice(1);
  }

  try {
    await rename(`./storage/${nestedPath}`, `./storage/${newName}`);
    res.json({ message: "Renamed successfully" });
  } catch (err) {
    res.status(404).json({ message: "Error renaming file" });
  }
});

// delete
app.delete("/files/*", async (req, res) => {
  const nestedPath = req.params[0] || "";
  const filePath = `./storage/${nestedPath}`;
  console.log(filePath);
  try {
    await rm(filePath, { recursive: true }); // recursive true => can delete folders too
    res.json({ message: "File delete successfully" });
  } catch (err) {
    res.status(404).json(err.message);
  }
});

app.listen(4000, (req, res) => {
  console.log("Server started");
});
