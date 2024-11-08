//imports
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("./models/user");
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

router.post("/add", async (req, res) => {
  try {
    const { userType, name, phone, cpf, city, email, password } = req.body;

    // validação dos dados
    if (!userType || !name || !phone || !cpf || !city || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    // inserção de dados
    const newUser = await User.create({
      cpf,
      userType,
      name,
      phone,
      city,
      email,
      password,
    });

    // Responds with success
    res
      .status(201)
      .json({ message: "Usuário registrado com sucesso!", User: newUser });
  } catch (error) {
    console.error("Erro ao registrar o usuário:", error); // Log the error
    res.status(500).json({
      message: "Erro ao registrar o usuário",
      error: error.message, // Include the error message in the response
    });
  }
});

module.exports = router;
