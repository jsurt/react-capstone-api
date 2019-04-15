const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({ content: String });
const scoreSchema = mongoose.Schema({
  isWon: Boolean,
  score: String
});

const matchSchema = mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "User"
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "User"
  },
  isSent: Boolean,
  isAccepted: Boolean,
  isCompleted: Boolean,
  message: {
    type: String,
    required: true
  },
  comments: [commentSchema],
  score: scoreSchema,
  sentAt: {
    type: String,
    required: true
  },
  datePlayed: String
});

matchSchema.methods.serialize = function() {
  return {
    id: this._id,
    senderId: this.senderId,
    receiverId: this.receiverId,
    isSent: this.isSent,
    isAccepted: this.isAccepted,
    isCompleted: this.isCompleted,
    message: this.message,
    comments: this.comments,
    score: this.score,
    sentAt: this.sentAt,
    datePlayed: this.datePlayed
  };
};

const Match = mongoose.model("Match", matchSchema);

module.exports = { Match };
