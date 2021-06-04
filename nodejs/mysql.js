var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "a1s2d3f4",
  database: "opentutorials",
});

connection.connect();

connection.query("SELECT * FROM topic", (err, result, fields) => {
  if (err) {
    console.log(err);
  }
  console.log(result);
});

connection.end();
