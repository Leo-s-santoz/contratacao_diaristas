const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define(
  "User",
  {
    userType: {
      // Nome no modelo
      type: DataTypes.STRING,
      allowNull: false,
      field: "tipo",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "nome",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "telefone",
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "cpf",
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "cidade",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "email",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "senha",
    },
  },
  {
    tableName: "usuarios", // Nome da tabela no banco de dados
    timestamps: false,
  }
);

module.exports = User;
