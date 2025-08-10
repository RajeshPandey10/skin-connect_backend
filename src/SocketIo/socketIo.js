import { Server } from "socket.io";
import http from "http";
import { app } from "../app.js";
import cors from "cors";
import { registerMessageFromSocket } from "../controllers/messageControllers.js";
import { Message } from "../models/messageModel.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected in socketId: ${socket.id}`);

  socket.on("joinRoom", ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join("_");
    socket.join(roomId);
  });

  socket.on("sendMessage", async ({ message, imageUrl, sender, receiver }) => {
    const messageDb = await registerMessageFromSocket({
      sender,
      receiver,
      message,
      imageUrl,
    });
    if (messageDb) {
      const roomId = [sender, receiver].sort().join("_");
      io.to(roomId).emit("receiveMessage", messageDb);

      const msgSender = await Message.findById(messageDb._id).populate(
        "sender",
        "name"
      );

      io.emit("updateUniquePersons", {
        sender,
        receiver,
        message,
        senderName: msgSender?.sender.name,
      });
    }
  });
});

export { app, io, server };
