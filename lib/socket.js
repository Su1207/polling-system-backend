import { Server } from "socket.io";
import http from "http";
import express from "express";
import { joinRoom, submitAnswer } from "../services/pollService.js";
import { createPoll } from "../controllers/pollController.js";
import Poll from "../models/pollModel.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://polling-system-eight-sage.vercel.app",
    ],
  },
});

let currentPoll = null;
let votes = {};
let connectedUsers = {};

const closePoll = async (pollId, reason, io) => {
  if (!currentPoll || currentPoll._id.toString() !== pollId.toString()) {
    return;
  }

  const poll = await Poll.findById(pollId);
  if (!poll) return;

  poll.options = poll.options.map((opt, idx) => ({
    ...opt.toObject(),
    count: (opt.count || 0) + (votes[idx] || 0),
  }));

  poll.status = "completed";
  await poll.save();

  currentPoll = null;
  votes = {};
  io.emit("pollClosed", poll);
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", ({ roomId, username, role }) => {
    joinRoom({ roomId, username, role, socket, io });
  });

  socket.on("createPoll", async (pollData) => {
    console.log("Received createPoll data:", pollData);
    try {
      if (currentPoll) {
        socket.emit("pollError", { message: "An active poll already exists" });
        return;
      }
      const newPoll = await createPoll(pollData);
      if (!newPoll) {
        socket.emit("pollError", { message: "An active poll already exists" });
        return;
      }
      currentPoll = newPoll;
      votes = {};
      const timer = newPoll.timer || 60;

      setTimeout(() => {
        closePoll(newPoll._id, "timeout", io);
      }, timer * 1000);

      io.emit("pollCreated", newPoll);
    } catch (err) {
      console.error("createPoll error:", err);
      socket.emit("pollError", { message: "Failed to create poll" });
    }
  });

  socket.on("submitAnswer", (answerData) => {
    console.log("Received answer:", answerData);

    votes[answerData] = (votes[answerData] || 0) + 1;
    io.emit("pollResults", votes);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { io, app, server };
