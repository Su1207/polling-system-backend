export const ensureRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      teacherSocketId: null,
      students: {},
      currentPoll: null,
      pollHistory: [],
    });
  }
  return rooms.get(roomId);
};

export const calcRemaining = (poll) => {
  if (!poll) return 0;
  const elapsed = (Date.now() - poll.startedAt) / 1000;
  return Math.max(0, Math.ceil(poll.durationSec - elapsed));
};

export const closePoll = (roomId, pollId, reason, io) => {
  const room = rooms.get(roomId);
  if (!room || !room.currentPoll) return;
  const poll = room.currentPoll;
  if (poll.pollId !== pollId) return;

  for (const sid of Object.keys(room.students)) {
    if (poll.answersBySocket[sid] === undefined) {
      poll.answersBySocket[sid] = "skipped";
    }
  }

  const finalResults = {
    pollId: poll.pollId,
    question: poll.question,
    options: poll.options,
    responses: poll.responses,
    answersBySocket: poll.answersBySocket,
    startedAt: poll.startedAt,
    durationSec: poll.durationSec,
    closedAt: Date.now(),
    closeReason: reason,
  };

  room.pollHistory.push(finalResults);
  room.currentPoll = null;

  io.to(roomId).emit("showResults", finalResults);
  if (room.teacherSocketId) {
    io.to(room.teacherSocketId).emit("pollClosed", { pollId, finalResults });
  }
  io.to(roomId).emit("studentListUpdated", { students: room.students });
};

export const joinRoom = ({ roomId, username, role, socket, io }) => {
  const room = ensureRoom(roomId);
  socket.join(roomId);

  if (role === "teacher") {
    room.teacherSocketId = socket.id;
    socket.data = { role: "teacher", roomId, username };
    socket.emit("roomState", {
      students: room.students,
      currentPoll: room.currentPoll
        ? {
            ...room.currentPoll,
            timeRemaining: calcRemaining(room.currentPoll),
          }
        : null,
      pollHistory: room.pollHistory,
    });
  } else {
    room.students[socket.id] = { username, connected: true };
    socket.data = { role: "student", roomId, username };
    io.to(roomId).emit("studentListUpdated", { students: room.students });

    if (room.currentPoll) {
      const cp = room.currentPoll;
      socket.emit("newQuestion", {
        pollId: cp.pollId,
        question: cp.question,
        options: cp.options,
        durationSec: cp.durationSec,
        startedAt: cp.startedAt,
        timerRemaining: calcRemaining(cp),
      });
    }
  }
};

export const submitAnswer = ({ roomId, pollId, optionIndex, io, socket }) => {
  const room = rooms.get(roomId);
  if (!room?.currentPoll) return;
  const poll = room.currentPoll;
  if (poll.pollId !== pollId) return;
  if (poll.answersBySocket[socket.id] !== undefined) return;

  const chosenOption = poll.options[optionIndex];
  const isCorrect = chosenOption?.isCorrect || false;

  poll.answersBySocket[socket.id] = {
    chosen: optionIndex,
    correct: isCorrect,
  };
  poll.responses[optionIndex]++;

  io.to(roomId).emit("updateResults", {
    pollId,
    partial: true,
    responses: poll.responses,
  });

  const totalStudents = Object.keys(room.students).length;
  const answeredCount = Object.keys(poll.answersBySocket).length;
  if (answeredCount >= totalStudents) {
    clearTimeout(poll.timerId);
    closePoll(roomId, poll.pollId, "all_answered", io);
  }
};
