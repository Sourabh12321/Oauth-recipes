const {Sequelize} = require("sequelize");
require("dotenv").config();


const seq = new Sequelize(
  process.env.DATABASE,
  process.env.UNAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
  }
);


seq
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });


module.exports = { seq };