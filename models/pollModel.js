import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [
    {
      option: { type: String, required: true },
      isCorrect: { type: Boolean, default: false },
      count: { type: Number, default: 0 },
    },
  ],
  timer: { type: Number, default: 60 },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
