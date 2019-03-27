const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const { User } = require("../models/users");
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });

//Get all users
router.get("/", jwtAuth, (req, res) => {
  User.find()
    .then(users => {
      res.status(200).json({
        users: users.map(users => users.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Sort users by state
//When jwt is finished change 'req.params.state' to 'req.user.state'
router.get("/:state", jwtAuth, (req, res) => {
  User.find({ state: req.params.state })
    .then(users => {
      res.status(200).json({
        users: users.map(users => users.serialize())
      });
    })
    .catch(err => {
      console.error(err);
    });
});

module.exports = { router };
