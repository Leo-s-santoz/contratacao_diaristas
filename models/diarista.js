const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = require("./user");

const Diarista = sequelize.define(
  "Diarista",
  {
    description: {
      // Nome no modelo
      type: DataTypes.TEXT,
      allowNull: false,
      field: "descricao",
    },
  },
  {
    tableName: "diaristas", // Nome da tabela no banco de dados
    timestamps: false,
  }
);

Diarista.belongsTo(User, { foreignKey: "id_usuario" });
User.hasOne(Diarista, { foreignKey: "id_usuario" });

module.exports = Diarista;
