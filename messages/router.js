"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const { Message } = require("../models/messages");
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
router.get("/:id", jwtAuth, (req, res) => {
  Message.find({ receiverId: req.params.id })
    .then(msgs => {
      console.log(msgs);
      res.status(200).json({
        messages: msgs.map(msgs => msgs.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Post endpoint for new message
router.post("/:id", jwtAuth, (req, res) => {
  const requiredFields = ["receiverId", "subject", "content"];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const missingFieldMessage = `Missing ${field} field in request body`;
      return res.status(400).send(missingFieldMessage);
    }
  });
  Message.create({
    senderId: req.params.id,
    receiverId: req.body.receiverId,
    isSent: true,
    isRead: false,
    subject: req.body.subject,
    content: req.body.content,
    sentAt: req.body.sentAt
  })
    .then(msg => {
      console.log("Message sent");
      const messageSentMsg = "The message has been sent";
      res.status(201).json({ message: messageSentMsg });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Update message to change 'isRead' from TRUE to FALSE
router.put("/:id", jwtAuth, (req, res) => {
  let _id = req.params.id;
  const updateableField = "isRead";
  if (!(updateableField in req.body)) {
    const uneditableFieldMsg = `Only ${updateableField} field can be updated`;
    return res.status(400).send(uneditableFieldMsg);
  }
  Message.findByIdAndUpdate({ _id }, { isRead: true })
    .then(msg => {
      console.log("Updating message");
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Delete message
router.delete("/:id", jwtAuth, (req, res) => {
  Message.findByIdAndDelete(req.params.id)
    .then(msg => {
      const deleteMessage = `Message with id ${req.params.id} has been deleted`;
      res.status(204).send(deleteMessage);
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

module.exports = { router };
