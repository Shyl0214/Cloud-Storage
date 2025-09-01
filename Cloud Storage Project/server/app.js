import express from "express";
import { readdir } from "fs/promises";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

// Enabling Cors 
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

// this will server the static files
const serveStatic = express.static("storage");

// serving files ( custom middleware )
app.use((req, res, next) => {
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  serveStatic(req, res, next);
});

// serving dir content 
app.get("/", async (req, res) => {
  const filesList = await readdir("./storage");
  res.json(filesList);
});

app.listen(4000, (req, res) => {
  console.log("Server started");
});
