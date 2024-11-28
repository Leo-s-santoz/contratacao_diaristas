const Diarista = require("../models/diarista");

async function authDiarista(req, res, next) {
  try {
    const userId = req.user.id; // ID do usuário autenticado
    const diaristaId = req.params.id; // ID do diarista passado na rota

    console.log(`Diarista ID: ${diaristaId}`);
    console.log(`User ID: ${userId}`);

    // Verifica se a diarista existe e pertence ao usuário autenticado
    const diarista = await Diarista.findByPk(diaristaId);

    if (!diarista || diarista.userId !== userId) {
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
