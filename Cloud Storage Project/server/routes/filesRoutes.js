import express from "express";
import { createWriteStream } from "fs";
import { rm, rename, writeFile } from "fs/promises";
import path from "path";
import { json } from "stream/consumers";
import filesData from "../fileDB.json" with {type: "json"};

const router = express.Router(); // this is the route

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  // console.log(fileData.extension);
  try {
    if (req.query.action === "download") {
      res.set("Content-Disposition", "attachment");
    }
    res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`);
  } catch (err) {
    res.status(400).json({ message: "File not found" });
  }
});

router.post("/:filename", (req, res) => {
  const { filename } = req.params;
  const extension = path.extname(filename);
  const id = crypto.randomUUID();
  const newFilename = `${id}${extension}`;

  try {
    const writeStream = createWriteStream(`./storage/${newFilename}`);
    req.pipe(writeStream);

    req.on("end", async () => {
      filesData.push({
        id: id,
        extension: extension,
        name: filename,
      });
      // console.log(filesData);
      await writeFile("./fileDB.json", JSON.stringify(filesData));
      res.json({ message: "File uploaded successfully" });
    });
  } catch (err) {
    res.json({ message: "File was not uploaded" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { newFilename } = req.body;

  try {
    const fileToUpdate = filesData.find((file) => file.id === id);
    fileToUpdate.name = newFilename;
    await writeFile("./fileDB.json", JSON.stringify(filesData , null , 2));
    res.json({message : "File renamed successfully"})
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const fileData = filesData.find((file) => file.id === id);
  const filePath = `./storage/${id}${fileData.extension}`;
  try {
    await rm(filePath);
    const newFileData = filesData.filter((file) => file.id !== id);
    await writeFile("./fileDB.json", JSON.stringify(newFileData));

    res.json({ message: "File delete successfully" });
  } catch (err) {
    res.status(404).json(err.message);
  }
});

export default router;
