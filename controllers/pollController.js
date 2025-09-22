import Poll from "../models/pollModel.js";

export const createPoll = async (pollData) => {
  try {
    const { question, options, timer } = pollData;
    if (!question || !options || options.length < 2) {
      throw new Error("Invalid poll data");
    }

    const activePoll = await Poll.findOne({ status: "active" });
    if (activePoll) {
      return null;
    }

    const newPoll = new Poll({
      question,
      options,
      timer: timer || 60,
    });

    await newPoll.save();

    return newPoll;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create poll");
  }
};
