import express from "express";
import { app, server } from "./lib/socket.js";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
