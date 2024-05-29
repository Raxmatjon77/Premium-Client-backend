const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.HOST_TEST,
  user: process.env.ROOT_TEST,
  database: process.env.DATABASE_TEST,
  password: process.env.PASSWORD_TEST,
});

module.exports = connection;