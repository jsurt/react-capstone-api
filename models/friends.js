const mongoose = require("mongoose");

const friendSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  location: String,
  friendOf: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "User"
  }
});

const Friend = mongoose.model("Friend", friendSchema);
