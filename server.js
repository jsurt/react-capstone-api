"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");

const app = express();

mongoose.Promise = global.Promise;

const { CLIENT_ORIGIN, PORT, DATABASE_URL } = require("./config");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");
const { router: friendsRouter } = require("./friends");
const { router: matchesRouter } = require("./matches");
const { router: usersRouter } = require("./users");
const { router: communityRouter } = require("./community");

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(morgan("common"));
app.use(express.json());
app.use(
  bodyParser.json({
    type: "application/json"
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use("/auth", authRouter);
app.use("/friends", friendsRouter);
app.use("/matches", matchesRouter);
app.use("/users", usersRouter);
app.use("/community", communityRouter);

const jwtAuth = passport.authenticate("jwt", { session: false });

app.get("/", (req, res) => {
  res.json({ ok: true });
});

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }

        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      },
      { useNewUrlParser: true }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
