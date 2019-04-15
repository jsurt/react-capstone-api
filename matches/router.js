"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const { Match } = require("../models/matches");
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });

//Test user id
const testMsgId = "5c99217bc843846052c73b88";
const testMsgSubject = "Lorem ipsum";
const testMsgContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam maximus est id nulla vehicula bibendum. Aliquam sagittis diam nec lectus rutrum, fringilla fermentum dolor aliquam. Nunc elementum leo sit amet ex aliquet hendrerit.";

//Testing router
router.get("/test", jwtAuth, (req, res) => {
  console.log("test");
  res.status(200).json({ message: "Hello world" });
});

//Write get endpoint here... maybe like 'messages/:id' where ':id' is the receiver id
router.get("/", jwtAuth, (req, res) => {
  Match.find({ $or: [{ receiverId: req.user.id }, { senderId: req.user.id }] })
    .populate("senderId")
    .populate("receiverId")
    .then(matches => {
      //console.log("Hello World");
      //console.log(matches);
      res.status(200).json({
        matches: matches.map(match => match.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Post endpoint for new message
router.post("/", jwtAuth, (req, res) => {
  console.log("hello world");
  const requiredFields = ["receiverId", "message"];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const missingFieldMessage = `Missing ${field} field in request body`;
      return res.status(400).send(missingFieldMessage);
    }
  });
  Match.create({
    senderId: req.user.id,
    receiverId: req.body.receiverId,
    isSent: true,
    isAccepted: false,
    isCompleted: false,
    message: req.body.message,
    score: null,
    comments: [],
    sentAt: req.body.sentAt,
    datePlayed: null
  })
    .then(match => {
      console.log("Match invite sent");
      const matchSentMsg = "The match invitation has been sent";
      res.status(201).json({ message: matchSentMsg });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Update message to change 'isRead' from TRUE to FALSE
router.put("/:id", jwtAuth, (req, res) => {
  //console.log(req.body);
  const _id = req.params.id;
  const { isAccepted, isCompleted, comment, score, datePlayed } = req.body;
  const updateableField = [
    "isAccepted",
    "isCompleted",
    "comment",
    "score",
    "datePlayed"
  ];
  console.log(isAccepted);
  updateableField.forEach(field => {
    if (!(field in req.body)) {
      const uneditableFieldMsg = `Only ${updateableField} field can be updated`;
      return res.status(400).send(uneditableFieldMsg);
    }
  });
  Match.findByIdAndUpdate(_id, { isAccepted, isCompleted })
    .then(match => {
      console.log(match.comments);
      if (score !== null) {
        (match.score = score), (match.datePlayed = datePlayed);
        match.save();
      } else if (comment.length > 0) {
        match.comments.push({ content: comment });
        match.save();
      } else {
        console.log("I do not know what to put here");
      }
      console.log("Updating match to" + match);
      res.status(204).json({ message: "Updated match" });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Delete message
router.delete("/:id", jwtAuth, (req, res) => {
  Match.findByIdAndDelete(req.params.id)
    .then(msg => {
      const deleteMatch = `Message with id ${req.params.id} has been deleted`;
      res.status(204).send(deleteMatch);
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

module.exports = { router };
