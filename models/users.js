"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

userSchema.methods.serialize = function() {
  return {
    id: this._id,
    firstname: this.firstname || "",
    lastname: this.lastname || "",
    username: this.username || "",
    location: this.location || "",
    friends: this.friends || ""
  };
};

userSchema.virtual("fullName").get(() => {
  return `${this.firstname} ${this.lastname}`;
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };

//
User.findById().populate("friends");
