//exports.CLIENT_ORIGIN = "https://intense-headland-64831.herokuapp.com";
exports.CLIENT_ORIGIN = "http://localhost:3000";
exports.PORT = process.env.PORT || 8080;
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/matcher-dev-db";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-matcher-dev-db";
exports.JWT_SECRET = "VERYSECRETKEY";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
