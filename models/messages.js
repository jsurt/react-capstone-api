const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
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
  isRead: Boolean,
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: String,
    required: true
  }
});

messageSchema.methods.serialize = function() {
  return {
    id: this._id,
    senderId: this.senderId,
    receiverId: this.receiverId,
    subject: this.subject,
    content: this.content,
    isSent: this.isSent,
    isRead: this.isRead,
    sentAt: this.sentAt
  };
};

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
