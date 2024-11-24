//imports
const { Sequelize } = require("sequelize");
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const { hash } = require("crypto");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
} = require("./middleware/tokens");

//config
require("dotenv").config();
//permite uso do metodo POST
router.use(express.urlencoded({ extended: true }));
//bcrypt
const saltRounds = 10;

//rotas

//login
let refreshTokens = [];

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // verificar se campos estão preenchidos
    if (!email || !password) {
      return res.json({ message: "Email e senha são obrigatórios." });
    }
    //tentar achar user pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: "Usuário não encontrado" });
    }
    //verificar senha
    const storedPassword = user.password;

    const rightPassword = await bcrypt.compare(password, storedPassword);

    if (rightPassword) {
      // Seleciona apenas as informações do usuário
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        city: user.city,
        userType: user.userType,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      refreshTokens.push(refreshToken);

      return res.json({
        success: true,
        message: "Login bem-sucedido",
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
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

//renovação de tokens
router.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

//loggout revogação de tokens
router.delete("/logout", (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.sendStatus(204);
});

//
router.get("/register", (req, res) => {
  res.redirect("/pages/register/register.html");
});

//cadastro
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

//rota de teste
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acesso permitido", user: req.user });
});

//recupera informações do usuario
router.get("/account", authenticateToken, (req, res) => {
  const { id, name, city } = req.user;

  res.json({
    success: true,
    data: {
      id,
      name,
      city,
    },
  });
});

module.exports = router;
