const sequelize = require("sequelize");
const {seq } = require("../config/db");

const User = seq.define("recipesuser", {
  name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
  },
});

module.exports = { User };
