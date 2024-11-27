//imports
const { Sequelize } = require("sequelize");
const express = require("express");
const path = require("path");
const router = express.Router();
const User = require("./models/user");
const Diarista = require("./models/diarista");
const bcrypt = require("bcrypt");
const { hash } = require("crypto");
const jwt = require("jsonwebtoken");
const { authDiarista } = require("./middleware/authDiarista");
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
} = require("./middleware/tokens");
const { upload } = require("./middleware/cloudnary");

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
        userType: user.userType,
        name: user.name,
        phone: user.phone,
        city: user.city,
        email: user.email,
        profilePicture: user.profilePicture,
        id: user.id,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      refreshTokens.push(refreshToken);

      return res.json({
        success: true,
        message: "Login bem-sucedido",
        userType: user.userType,
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

    res.redirect("/pages/login/index.html");
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
router.get("/info", authenticateToken, (req, res) => {
  const { userType, name, phone, cpf, city, email, profilePicture, id } =
    req.user;

  res.json({
    success: true,
    userType,
    name,
    phone,
    cpf,
    city,
    email,
    profilePicture,
    id,
  });
});

//envio de fotos para o bd em formato em formato de URL
//LEMBRETE: add corte de imagem para formato 500x500
router.post(
  "/upload-profile-picture",
  authenticateToken,
  upload.single("image"),
  (req, res) => {
    //disponibilia a url em req.file.path
    const imageUrl = req.file.path;

    // Atualiza o perfil do usuário no bd com a URL da imagem
    User.update({ profilePicture: imageUrl }, { where: { id: req.user.id } })
      .then(() => res.json({ success: true, imageUrl }))
      .catch((err) =>
        res.status(500).json({ success: false, message: err.message })
      );
  }
);

//recuperar descrução no bd
router.get("/diarista", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const diarista = await Diarista.findOne({ where: { id_usuario: userId } });

    if (!diarista) {
      return res.status(404).json({ error: "Diarista não encontrada" });
    }

    res.json({
      success: true,
      description: diarista.description,
    });
  } catch (error) {
    console.error("Erro ao buscar diarista:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

//alterar informações de diarista
router.post(
  "/update-information",
  authenticateToken,
  authDiarista,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ error: "Descrição não fornecida." });
      }

      const diarista = await Diarista.update(
        { description },
        { where: { id_usuario: userId } }
      );

      if (diarista[0] === 0) {
        return res.status(404).json({ error: "Diarista não encontrada." });
      }

      return res.json({
        success: true,
        message: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao atualizar perfil." });
    }
  }
);

//listar diaristas
router.get("/list-diaristas", authenticateToken, async (req, res) => {
  try {
    const { city } = req.user;

    const diaristas = await User.findAll({
      where: {
        userType: "diarista",
        city: city,
      },
      attributes: ["id", "name"],
    });

    if (diaristas.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum diarista encontrado na sua cidade." });
    }

    res.status(200).json({
      success: true,
      data: diaristas,
    });
  } catch (error) {
    console.error("Erro ao buscar diaristas:", error);
    res.status(500).json({ message: "Erro ao buscar diaristas." });
  }
});

module.exports = router;
