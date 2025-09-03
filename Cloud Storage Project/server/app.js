import express from "express";
import { createWriteStream } from "fs";
import { readdir, rm, rename, stat } from "fs/promises";
import cors from "cors";

const app = express();

app.disable("x-powered-by");

app.use(express.json());

app.use(cors());

// this will server the static files
const serveStatic = express.static("storage");

// serving dir content
app.get("/directory", async (req, res) => {
  const fileList = await readdir("storage");
  const resData = [];
  for (let items of fileList) {
    const stats = await stat(`/storage${items}`);
    resData.push({
      name: `${items}`,
      isDirectory: stats.isDirectory(`${items}`),
    });
  }
  res.json(resData);
});

// dynamic routing
app.get("/files/:fileName", (req, res) => {
  console.log(req.query);
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  const { fileName } = req.params;
  console.log({ fileName });
  res.sendFile(`${import.meta.dirname}/storage/${fileName}`);
});

// upload
app.post("/files/:fileName", (req, res) => {
  console.log(req.params.fileName);
  const { fileName } = req.params;
  const writeStream = createWriteStream(`./storage/${req.params.fileName}`);
  req.pipe(writeStream);
  req.on("end", () => {
    res.json({ message: "File uploaded successfully" });
  });
});

//update
app.patch("/files/:fileName", async (req, res) => {
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
app.delete("/files/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const filePath = `./storage/${fileName}`;
  console.log(filePath);
  try {
    await rm(filePath);
    res.json({ message: "File delete successfully" });
  } catch (err) {
    res.status(404).json({ message: "File not found" });
  }
});

app.listen(4000, (req, res) => {
  console.log("Server started");
});
