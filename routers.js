//imports
const express = require("express");
const path = require("path");
const router = express.Router();
//imports

router.get("/login", (req, res) => {
  res.redirect("/pages/login/index.html");
});

router.get("/register", (req, res) => {
  res.redirect("/pages/register/register.html");
});

router.post("/add", function (req, res) {
  res.send("formulário recebido");
});

module.exports = router;
