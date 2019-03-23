const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`App is listening at port ${PORT}`);
});

module.exports = { app };
