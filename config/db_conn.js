var mysql = require('mysql');
const dotenv = require('dotenv')

// init env file
dotenv.config()

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // connectionLimit: 10,
    multipleStatements: true
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

module.exports = connection;
