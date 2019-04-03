const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const { User } = require("../models/users");
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });

//Testing router
router.get("/test", jwtAuth, (req, res) => {
  res.json({ message: "Hello world" }).status(200);
});

//Get all users
router.get("/", (req, res) => {
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

router.get("/data", jwtAuth, (req, res) => {
  User.findById(req.user.id)
    .populate("friends")
    .then(user => {
      console.log(user, "hello there");
      res.status(200).json({
        user: user.serialize()
      });
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "Internal server error has occurred";
      res.status(500).json({ message: errorMessage });
    });
});

//Register user here
router.post("/", (req, res) => {
  console.log(req.body);
  const requiredFields = [
    "firstname",
    "lastname",
    "username",
    "password",
    "state"
  ];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const missingFieldMessage = `Missing ${field} in request body`;
      return res.status(400).json({ message: missingFieldMessage });
    }
  });
  const stringFields = [
    "firstname",
    "lastname",
    "username",
    "password",
    "state"
  ];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== "string"
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Incorrect field type: expected string",
      location: nonStringField
    });
  }

  const explicityTrimmedFields = ["username", "password"];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: "Cannot start or end with whitespace",
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(field => {
    console.log(req.body);
    console.log(field);
    "min" in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min;
  });
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      "max" in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: "ValidationError",
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let { firstname, lastname, username, password, state } = req.body;
  firstname = firstname.trim();
  lastname = lastname.trim();

  return User.find({ username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: "ValidationError",
          message: "username already taken",
          location: "username"
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        firstname,
        lastname,
        username,
        password: hash,
        state
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      console.log(err);
      if (err.reason === "ValidationError") {
        return res.status(err.code).json(err);
      }
      res
        .status(500)
        .json({ code: 500, message: "Internal server error occurred!!" });
    });
});

router.delete("/:id", jwtAuth, (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(user => {
      console.log("User has been deleted");
      res.status(204).end();
    })
    .catch(err => {
      console.error(err);
      const errorMessage = "An internal server error has occurred";
      res.status(500).json({ msg: errorMessage });
    });
});

module.exports = { router };
