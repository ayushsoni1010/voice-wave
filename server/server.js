import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import initializeWebSocket from "./websocket.js";
import { Server } from "socket.io";

// No need to edit any of this code

const app = express();
const server = http.Server(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initializeWebSocket(io);

app.use(cors({ credentials: false, origin: "*" }));
app.use(express.json());

const staticPath = path.resolve("public/");
app.use(express.static(staticPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(staticPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
