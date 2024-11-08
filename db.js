const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("contratacao_diaristas", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado com sucesso!");
  })
  .catch(() => {
    console.log("Falha ao se conectar: " + erro);
  });

module.exports = sequelize;
