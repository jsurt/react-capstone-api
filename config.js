exports.CLIENT_ORIGIN = "https://intense-headland-64831.herokuapp.com";
//exports.CLIENT_ORIGIN = "http://localhost:3000";
exports.PORT = process.env.PORT || 8080;
exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/matcher-dev-db";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-matcher-dev-db";
exports.JWT_SECRET =
  "m2rqZ2dIt4uTcd4V9hliXvuoDT6-oh4S1OV_6T69hVXBP41pGp6yz33zIorIGXLrqeGaVOGet-AOYuXIrtDyx9tfIUjkO-9oDSMm34mU7U7q9fiS2OWYolM_GM7gjq_Q4dtXPy-l_m-mKYnnuyv70ZBNSLfKuIw8qSmM3p9JYG4rPlp5AkXlYupQh4VVajWG5aJt3IC4WGntBOkSPWZXepvjasBQGXkRqV7w85I1uz0FLKetZYTuHXCHUjFGPtf9OH0_FPfMk-B5DG08g1AMV02EB188FLDr3StDFheAgQ0eZd_ttGEaBrIrXmzzJz3AVDp4X4yfhxcBT8ds-DmYGQ";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
