const mongoose = require("mongoose");

const friendSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  state: String,
  friendOf: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "User"
  }
});

const Friend = mongoose.model("Friend", friendSchema);
