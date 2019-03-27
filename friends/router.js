"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const { User } = require("../models/users");
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });

//Testing router
router.get("/test", jwtAuth, (req, res) => {
  console.log("test");
  res.json({ message: "Hello world" }).status(200);
});

//Get friends of user
router.get("/:id", jwtAuth, (req, res) => {
  User.findById(req.params.id)
    .populate("friends")
    .then(user => {
      res.json({ friends: user.friends });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "There was an internal server error";
    });
});

const testPost = "5c992166c843846052c73b86";

//Add a friend
router.post("/:id", jwtAuth, (req, res) => {
  console.log("Posting new friend");
  User.findByIdAndUpdate(req.params.id)
    .then(user => {
      console.log(testPost);
      user.friends.push(testPost);
      user.save();
      res.status(201).end();
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "An internal server error occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Delete a friend
router.delete("/:id", jwtAuth, (req, res) => {
  User.findByIdAndUpdate(req.params.id)
    .then(user => {
      console.log(testPost);
      user.friends.pull(testPost);
      user.save();
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "An internal server error occurred";
      res.status(500).json({ message: errorMessage });
    });
});

module.exports = { router };
