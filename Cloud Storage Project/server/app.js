import express from "express";
import cors from "cors";
import fileRoute from "./routes/fileRoutes.js";
import directoryRoute from "./routes/directoryRoutes.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cors());

const serveStatic = express.static("storage");

app.use("/directory", directoryRoute);
app.use("/file", fileRoute);

app.use((req, res, next) => {
  if (req.query.action === "download") {
    res.setHeader("Content-Disposition", "attachment");
  }
  serveStatic(req, res, next);
});

app.listen(4000, (req, res) => {
  console.log("Server started");
});
