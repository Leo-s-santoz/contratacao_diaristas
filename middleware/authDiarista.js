const Diarista = require("../models/diarista");

async function authDiarista(req, res, next) {
  try {
    const userId = req.headers.id;
    const diaristaId = req.headers["diarista-id"];

    if (!diaristaId) {
      return res.status(400).json({
        success: false,
        message: "diaristaId não fornecido no cabeçalho",
      });
    }

    console.log(`Diarista ID: ${diaristaId}`);
    console.log(`User ID: ${userId}`);

    const diarista = await Diarista.findOne({
      where: {
        id_usuario: diaristaId,
      },
    });

    if (!diarista || diarista == null) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado!",
      });
    }

    // Se passar na validação, segue para a próxima função ou rota
    next();
  } catch (error) {
    console.error("Erro no middleware authDiarista:", error);
    return res.status(500).json({
      success: false,
      message: "Erro de autorização",
    });
  }
}

module.exports = { authDiarista };
