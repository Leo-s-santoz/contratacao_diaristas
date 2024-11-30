const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = require("./user");

const Favorites = sequelize.define(
  "Favorites", // Nome da tabela
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_favoritado: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "favoritos", // Nome da tabela no banco de dados
    timestamps: false, // Se não for necessário usar createdAt/updatedAt
  }
);

// Relacionamento: Favoritos -> Usuário
Favorites.belongsTo(User, { foreignKey: "id_usuario", targetKey: "id" });
Favorites.belongsTo(User, { foreignKey: "id_favoritado", targetKey: "id" });

module.exports = Favorites;
