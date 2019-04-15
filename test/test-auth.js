"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");

const { app, runServer, closeServer } = require("../server");
const { User } = require("../models/users");
const { JWT_SECRET, TEST_DATABASE_URL } = require("../config");

const expect = chai.expect;

chai.use(chaiHttp);

describe("Auth endpoints", function() {
  const username = "testuser";
  const password = "password123";
  const firstName = "Test";
  const lastName = "User";
  const location = "CA";

  before(function() {
    console.log("before");
    runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password =>
      User.insertMany({
        username,
        password,
        firstName,
        lastName,
        location
      })
    );
  });

  afterEach(function() {
    return User.deleteMany({});
  });

  describe("/auth/login", function() {
    it("Should reject requests with no credentials", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .then(variable => {
          expect(variable).to.have.status(400);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(400);
        });
    });
    it("Should reject requests with incorrect usernames", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username: "wrongUsername", password })
        .then(res => expect(res).to.have.status(401))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it("Should reject requests with incorrect passwords", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username, password: "wrongPassword" })
        .then(res => expect(res).to.have.status(401))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it("Should return a valid auth token", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          const token = res.body.authToken;
          expect(token).to.be.a("string");
          const payload = jwt.verify(token, "VERYSECRETKEY", {
            algorithm: ["HS256"]
          });
          expect(payload.user).to.have.keys([
            "id",
            "username",
            "firstname",
            "lastname",
            "location",
            "friends"
          ]);
        });
    });
  });

  describe("/auth/refresh", function() {
    it("Should reject requests with no credentials", function() {
      return chai
        .request(app)
        .post("/auth/refresh")
        .then(res => expect(res).to.have.status(401))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it("Should reject requests with an invalid token", function() {
      const token = jwt.sign(
        {
          username,
          firstName,
          lastName
        },
        "wrongSecret",
        {
          algorithm: "HS256",
          expiresIn: "7d"
        }
      );

      return chai
        .request(app)
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${token}`)
        .then(res => expect(res).to.have.status(401))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it("Should reject requests with an expired token", function() {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: username
        }
      );

      return chai
        .request(app)
        .post("/auth/refresh")
        .set("authorization", `Bearer ${token}`)
        .then(res => expect(res).to.have.status(401))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it("Should return a valid auth token with a newer expiry date", function() {
      const token = jwt.sign(
        {
          user: {
            username,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          algorithm: "HS256",
          subject: username,
          expiresIn: "7d"
        }
      );
      const decoded = jwt.decode(token);

      return chai
        .request(app)
        .post("/auth/refresh")
        .set("authorization", `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          const token = res.body.authToken;
          expect(token).to.be.a("string");
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ["HS256"]
          });
          expect(payload.user).to.deep.equal({
            username,
            firstName,
            lastName
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
});
