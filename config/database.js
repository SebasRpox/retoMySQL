const mysql = require("mysql2");
require("dotenv").config();

const conection_mysql = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABSE,
    port: process.env.DB_PORT
});

module.exports = {
    cnn_mysql: conection_mysql
}