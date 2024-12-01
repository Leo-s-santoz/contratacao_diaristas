//imports
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const SMTP_CONFIG = require("./mailerconfig");

//models
const User = require("./models/user");
const Diarista = require("./models/diarista");
const Contratante = require("./models/contratante");
const Favorites = require("./models/favoritos");

//middleware
const { authDiarista } = require("./middleware/authDiarista");
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
} = require("./middleware/tokens");
const { upload } = require("./middleware/cloudnary");
const { decrypt, encrypt } = require("./middleware/encrypt");
const { error } = require("console");
const { url } = require("inspector");

//config
require("dotenv").config();
//permite uso do metodo POST
router.use(express.urlencoded({ extended: true }));
//bcrypt
const saltRounds = 10;
//mailer
const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: false,
  auth: {
    user: SMTP_CONFIG.user,
    pass: SMTP_CONFIG.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

////ROTAS////

//login
let refreshTokens = [];

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.json({ message: "Email e senha são obrigatórios" });
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
        .json({ message: "Todos os campos são obrigatórios" });
    }

    if (userType == "Diarista" && !description) {
      return res
        .status(400)
        .json({ message: "Descrição é obrigatória para diaristas" });
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
      attributes: [
        "id",
        "userType",
        "email",
        "name",
        "phone",
        "city",
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
      return res.status(400).json({ error: "Descrição não fornecida" });
    }

    const diarista = await Diarista.update(
      { description },
      { where: { id_usuario: userId } }
    );

    if (diarista[0] === 0) {
      return res.status(404).json({ error: "Diarista não encontrada" });
    }

    return res.json({
      success: true,
      message: "Perfil atualizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar perfil" });
  }
});

router.post("/update-city", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { city } = req.body;

  if (!id || !city) {
    return res.status(400).json({ error: "São necessários dados válidos" });
  }

  try {
    const updateCity = await User.update({ city }, { where: { id: id } });

    if (updateCity[0] === 0) {
      return res.status(404).json({ error: "Usuario não encontrado" });
    }

    return res.json({
      success: true,
      message: "Perfil atualizado com sucesso!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Erro ao atualizar perfil" });
  }
});

//listar diaristas
router.get("/list-diaristas", authenticateToken, async (req, res) => {
  try {
    const { city, id } = req.user;

    if (!id) {
      return res.status(400).json({ message: "ID de usuário não fornecido" });
    }

    console.log("Consultando diaristas com filtros:", {
      userType: "diarista",
      city: city,
      id: { [Op.ne]: id },
    });

    // Consulta ao banco de dados
    const diaristas = await User.findAll({
      where: {
        userType: "diarista",
        city: city,
        id: { [Op.ne]: id },
      },
      attributes: ["id", "name", "profilePicture"],
    });

    if (!diaristas || diaristas.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum diarista encontrado na sua cidade" });
    }

    res.status(200).json({
      success: true,
      data: diaristas,
    });
  } catch (error) {
    console.error("Erro ao buscar diaristas:", error);
    res.status(500).json({
      message: "Erro ao buscar diaristas",
      error: error.message || error,
    });
  }
});

//criptografar tokens
router.post("/encrypt", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token é necessário" });
    }

    const encryptedToken = await encrypt(token);

    res.json({ encryptedToken });
  } catch (error) {
    console.error("Erro na encriptação:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

//descriptografar tokens
router.post("/decrypt", async (req, res) => {
  const { encryptedData, iv, authTag } = req.body;

  if (!encryptedData || !iv || !authTag) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  try {
    const decryptedToken = await decrypt(encryptedData, iv, authTag);
    res.json({ decryptedToken });
  } catch (error) {
    console.error("Erro na descriptografia:", error);
    res.status(500).json({ error: "Erro ao descriptografar o token" });
  }
});

//favoritar/desfavoritar
router.post("/update-favorite", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { urlId, favorited } = req.body;

  if (!urlId || favorited === undefined) {
    return res.status(400).json({ error: "São necessários dados válidos" });
  }

  try {
    const targetUser = await User.findOne({
      where: {
        id: urlId,
      },
    });
    if (!targetUser) {
      return res
        .status(404)
        .json({ error: "Usuário a ser favoritado não encontrado" });
    }

    if (favorited) {
      // adicionar favorito
      const [favorite, created] = await Favorites.findOrCreate({
        where: {
          id_usuario: id,
          id_favoritado: urlId,
        },
      });

      if (created) {
        return res
          .status(201)
          .json({ message: "Favorito adicionado com sucesso" });
      }
      return res.status(200).json({ message: "Usuário já está favoritado" });
    }

    // remover favorito
    const result = await Favorites.destroy({
      where: {
        id_usuario: id,
        id_favoritado: urlId,
      },
    });

    if (result > 0) {
      return res.status(200).json({ message: "Favorito removido com sucesso" });
    }

    return res.status(404).json({ error: "Favorito não encontrado" });
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

//verificar favorito
router.get("/verify-favorite/:urlId", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { urlId } = req.params;

  if (!urlId || !id) {
    return res.status(400).json({ error: "São necessários dados válidos" });
  }

  try {
    const isFavorited = await Favorites.findOne({
      where: {
        id_usuario: id,
        id_favoritado: urlId,
      },
    });

    if (isFavorited) {
      res.status(200).json({ isFavorited: true });
    } else {
      res.status(200).json({ isFavorited: false });
    }
  } catch (error) {
    console.error("Erro ao verificar favorito:", error);
    res.status(500).json({ error: "Busca mal sucedida" });
  }
});

//buscar favorito
router.get("/search-favorites", authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(400).json({ message: "ID de usuário não fornecido" });
    }

    const favoritedIds = await Favorites.findAll({
      where: { id_usuario: id },
      attributes: ["id_favoritado"],
    });

    if (!favoritedIds || favoritedIds.length === 0) {
      return res
        .status(404)
        .json({ message: "Você ainda não favoritou nenhum diarista" });
    }

    const diaristaIds = favoritedIds.map((record) => record.id_favoritado);

    const diaristas = await User.findAll({
      where: {
        id: { [Op.in]: diaristaIds },
        userType: "diarista",
      },
      attributes: ["id", "name", "profilePicture", "city"],
    });

    if (!diaristas || diaristas.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum diarista favoritado encontrado" });
    }

    res.status(200).json({
      success: true,
      data: diaristas,
    });
  } catch (error) {
    console.error("Erro ao buscar diaristas favoritos:", error);
    res.status(500).json({
      message: "Erro ao buscar diaristas favoritos",
      error: error.message || error,
    });
  }
});

//enviar email de contato
router.post("/send-mail", authenticateToken, async (req, res) => {
  const dataContratante = req.body.dataContratante.user;
  const dataDiarista = req.body.dataDiarista.user;

  if (!dataContratante || !dataDiarista) {
    console.error("Busca de usuários mal sucedida: ", error);
  } else {
    try {
      const mailerOptions = {
        from: SMTP_CONFIG.user,
        to: dataDiarista.email,
        replyTo: dataContratante.email,
        subject: "Tenho interesse em contratar seu serviço de diarista!",
        text: `Olá me chamo ${dataContratante.name}, achei seu perfil no Tudo em dia e gostaria de contratar seu serviço de diarista, por favor entre em contato pelo número ${dataContratante.phone}, responda a este email, ou envie diretamente para ${dataContratante.email}`,
      };

      //evniar
      const info = await transporter.sendMail(mailerOptions);
      console.log("Email enviado: ", info.response);

      return res.status(200).json({ message: "Email enviado com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar email: ", error);
    }
  }
});

module.exports = router;
