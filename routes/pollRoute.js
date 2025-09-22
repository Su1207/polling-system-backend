import express from "express";
import { createPoll } from "../controllers/pollController.js";

const router = express.Router();

router.post("/create-poll", createPoll);

export default router;
