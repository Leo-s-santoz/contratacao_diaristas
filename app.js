//imports
const express = require("express");
const path = require("path");
//imports

const app = express();

app.use(express.static(path.join(__dirname, "/pages")));

app.use(express.static(path.join(__dirname)));

app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/pages/login/index.html"));
});

app.listen(3036, function () {
  console.log("Servidor Rodando na porta 3036");
});
