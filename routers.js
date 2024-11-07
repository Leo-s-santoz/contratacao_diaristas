//imports
const express = require("express");
const path = require("path");
const router = express.Router();
//imports

//config
//permite uso do metodo POST
router.use(express.urlencoded({ extended: true }));

//rotas
router.get("/login", (req, res) => {
  res.redirect("/pages/login/index.html");
});

router.get("/register", (req, res) => {
  res.redirect("/pages/register/register.html");
});

router.post("/register", function (req, res) {
  res.send(`
      Tipo: ${req.body.userType} <br>
      Nome: ${req.body.name} <br>
      CPF: ${req.body.cpf} <br>
      Cidade: ${req.body.city} <br>
      Email: ${req.body.email} <br>
      Senha: ${req.body.password}
  `);
});

module.exports = router;
