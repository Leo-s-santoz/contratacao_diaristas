const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = require("./user");

const Contratante = sequelize.define(
  "Contratante",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_usuario",
    },
  },
  {
    tableName: "contratantes", // Nome da tabela no banco de dados
    timestamps: false,
  }
);

Contratante.belongsTo(User, { foreignKey: "id_usuario" });
User.hasOne(Contratante, { foreignKey: "id_usuario" });

module.exports = Contratante;
