const Diarista = require("../models/diarista");

async function authDiarista(req, res, next) {
  try {
    const userId = req.user.id;

    const diarista = await Diarista.findOne({
      where: { id_usuario: userId },
    });

    if (!diarista) {
      return res
        .status(403)
        .json({ success: false, message: "Acesso negado!" });
    }
    //se não for barrado pela validação segue normalmente para a rota
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Erro de autoriazação " });
  }
}

module.exports = { authDiarista };
