var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "a1s2d3f4",
  database: "opentutorials",
});
db.connect();
module.exports = db;
