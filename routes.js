//imports
const { Sequelize } = require("sequelize");
const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//models
const User = require("./models/user");
const Diarista = require("./models/diarista");
const Contratante = require("./models/contratante");

//middleware
const { authDiarista } = require("./middleware/authDiarista");
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
} = require("./middleware/tokens");
const { upload } = require("./middleware/cloudnary");
const { decrypt, encrypt } = require("./middleware/encrypt");

//config
require("dotenv").config();
//permite uso do metodo POST
router.use(express.urlencoded({ extended: true }));
//bcrypt
const saltRounds = 10;

////ROTAS////

//login
let refreshTokens = [];

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.json({ message: "Email e senha são obrigatórios." });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: "Usuário não encontrado" });
    }
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
        id: user.id,
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

//cadastro
router.post("/add", async (req, res) => {
  console.log(req.body);

  try {
    const { userType, name, phone, cpf, city, email, password, description } =
      req.body;

    if (!userType || !name || !phone || !cpf || !city || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    if (userType == "Diarista" && !description) {
      return res
        .status(400)
        .json({ message: "Descrição é obrigatória para diaristas." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      cpf,
      userType,
      name,
      phone,
      city,
      email,
      password: hashedPassword,
    });

    if (userType == "Diarista") {
      await Diarista.create({
        id_usuario: newUser.id, // Usa o ID gerado do usuário
        description,
      });
    } else if (userType == "Contratante")
      await Contratante.create({
        id_usuario: newUser.id,
      });
    res.redirect("/pages/login/index.html");
  } catch (error) {
    console.error("Erro ao registrar o usuário:", error); // Log do erro
    res.status(500).json({
      message: "Erro ao registrar o usuário",
      error: error.message, // Inclui a mensagem de erro na resposta
    });
  }
});

//rota de teste
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Acesso permitido", user: req.user });
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

//buscar informações pelo id do usuário logado
router.get("/account-info", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "userType", "name", "phone", "city", "profilePicture"],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
});

//recupera informações pelo id da url
router.get("/info/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "userType",
        "name",
        "phone",
        "city",
        "email",
        "profilePicture",
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    res.status(500).json({ success: false, message: "Erro no servidor" });
  }
});

//recuperar descrição no bd
router.get("/description/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const diarista = await Diarista.findOne({ where: { id_usuario: userId } });

    if (!diarista) {
      return res.status(404).json({ error: "Diarista não encontrada" });
    }

    res.json({
      success: true,
      description:
        diarista.description ||
        "Parece que ainda não foi colocada uma descrição",
    });
  } catch (error) {
    console.error("Erro ao buscar diarista:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

//alterar informações de diarista
router.post("/update-information", authenticateToken, async (req, res) => {
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
});

//listar diaristas
router.get("/list-diaristas", authenticateToken, async (req, res) => {
  try {
    const { city } = req.user;

    const diaristas = await User.findAll({
      where: {
        userType: "diarista",
        city: city,
      },
      attributes: ["id", "name", "profilePicture"],
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

//criptografar tokens
router.post("/encrypt", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token é necessário." });
    }

    const encryptedToken = await encrypt(token);

    res.json({ encryptedToken });
  } catch (error) {
    console.error("Erro na encriptação:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

//descriptografar tokens
router.post("/decrypt", async (req, res) => {
  const { encryptedData, iv, authTag } = req.body;

  if (!encryptedData || !iv || !authTag) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    const decryptedToken = await decrypt(encryptedData, iv, authTag);
    res.json({ decryptedToken });
  } catch (error) {
    console.error("Erro na descriptografia:", error);
    res.status(500).json({ error: "Erro ao descriptografar o token." });
  }
});

module.exports = router;
