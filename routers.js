//imports
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const { hash } = require("crypto");
//imports

//config
//permite uso do metodo POST
router.use(express.urlencoded({ extended: true }));
//bcrypt
const saltRounds = 10;

//rotas
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // verificar se campos estão preenchidos
    if (!email || !password) {
      return res.json({ message: "Email e senha são obrigatórios." });
    }
    //tentar achar user pelo email
    const usuario = await User.findOne({ where: { email } });
    if (!usuario) {
      return res.json({ message: "Usuário não encontrado" });
    }
    //verificar senha
    const storedPassword = usuario.password;

    const rightPassword = await bcrypt.compare(password, storedPassword);

    if (rightPassword) {
      return res.json({ success: true, message: "Login bem-sucedido" });
    } else {
      return res.json({ success: false, message: "Senha incorreta" });
    }
  } catch (error) {
    console.error("Erro no processo de login:", error);

    // define os diferentes possíveis erros
    if (error instanceof Sequelize.ConnectionError) {
      res.status(500).json({
        message: "Erro ao conectar ao banco de dados",
        suggestion: "Verifique a conexão com o banco de dados",
        error: error.message,
      });
    } else if (error instanceof Sequelize.ValidationError) {
      res.status(400).json({
        message: "Dados inválidos fornecidos",
        suggestion: "Confira os dados enviados e tente novamente",
        error: error.message,
      });
    } else {
      // caso contrário fornece uma resposta padrão
      res.status(500).json({
        message: "Erro interno ao processar o login",
        suggestion: "Tente novamente mais tarde ou contate o suporte",
        error: error.message,
      });
    }
  }
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

    //hash de senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // inserção de dados
    const newUser = await User.create({
      cpf,
      userType,
      name,
      phone,
      city,
      email,
      password: hashedPassword,
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
