//imports
const express = require("express");
const path = require("path");
const router = express.Router();
//imports

router.use(express.urlencoded({ extended: true }));

router.get("/login", (req, res) => {
  res.redirect("/pages/login/index.html");
});

router.get("/register", (req, res) => {
  res.redirect("/pages/register/register.html");
});

router.post("/register", function (req, res) {
  const { name, cpf, email, password } = req.body;
  res.send("formulário recebido");
});

module.exports = router;
