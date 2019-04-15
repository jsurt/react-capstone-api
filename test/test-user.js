"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const jwt = require("jsonwebtoken");

const { app, runServer, closeServer } = require("../server");
const { User } = require("../models/users");
const { JWT_SECRET, TEST_DATABASE_URL } = require("../config");

const expect = chai.expect;

chai.use(chaiHttp);

describe("POST to /users to create new user", function() {
  before(function() {
    runServer(TEST_DATABASE_URL);
  });

  after(function() {
    closeServer();
  });

  const username = faker.internet.userName();
  const password = "password123";
  const firstname = "Test";
  const lastname = "User";
  //const fullName = "Test User";
  const location = "CA";

  it("Should reject users without username", function() {
    return chai
      .request(app)
      .post("/users")
      .send({
        password,
        firstname,
        lastname,
        location
      })
      .then(variable => expect(variable).to.have.status(422))
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }
        const res = err.response;
        expect(res).to.have.status(422);
        expect(res.body.reason).to.equal("ValidationError");
        expect(res.body.message).to.equal("Missing field");
        expect(res.body.location).to.equal("username");
      });
  });

  it("Should create a new user", function() {
    return chai
      .request(app)
      .post("/users")
      .send({
        username,
        password,
        firstname,
        lastname,
        location
      })
      .then(res => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.keys(
          "id",
          "firstname",
          "lastname",
          "username",
          "location",
          "friends"
        );
        expect(res.body.firstname).to.equal(firstname);
        expect(res.body.lastname).to.equal(lastname);
        expect(res.body.username).to.equal(username);
        expect(res.body.location).to.equal(location);
        return User.findOne({
          username
        });
      })
      .then(user => {
        expect(user).to.not.be.null;
        expect(user.firstname).to.equal(firstname);
        expect(user.lastname).to.equal(lastname);
        expect(user.username).to.equal(username);
        expect(user.location).to.equal(location);
        return user.validatePassword(password);
      })
      .then(passwordIsCorrect => {
        expect(passwordIsCorrect).to.be.true;
      });
  });
});
