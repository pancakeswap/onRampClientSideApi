const http = require("http")
const socket = require("socket.io")
import "reflect-metadata"
import { Server } from 'http';
import app from './app';
import logger from './utils/logger';
import { createSocketMessage, getSocketMessages } from './database/queries';
import { connectDatabase } from "./database/database";

const port = Number(process.env.PORT);
const socketPort = 8003;

const server = http.createServer(app);
const io = socket(server, {
  cors: {
     origin: "http://localhost:3000",
     methods: ["GET", "POST"],
  },
});

export const emitMostRecentMessges = () => {
  getSocketMessages()
     .then((result) => io.emit("chat message", result))
     .catch(console.log);
};
// connects, creates message, and emits top 10 messages
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("chat message", (msg) => {
     createSocketMessage(JSON.parse(msg))
        .then((_) => {
           emitMostRecentMessges();
        })
        .catch((err) => io.emit(err));
});

// close event when user disconnects from app
  socket.on("disconnect", () => {
     console.log("user disconnected");
  });
});

// Displays in terminal which port the socketPort is running on
server.listen(socketPort, () => {
  console.log(`listening on *:${socketPort}`);
});

(async () => {
  await connectDatabase(false);
})();

