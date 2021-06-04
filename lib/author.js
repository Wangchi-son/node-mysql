var db = require("./db");
var template = require("./template.js");
var qs = require("querystring");

exports.home = (request, response) => {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    db.query(`SELECT * FROM author`, (err2, authors) => {
      var title = "author";
      var list = template.list(topics);
      var html = template.HTML(
        title,
        list,
        `
        ${template.authorTable(authors)}
        <style>
            table {
                border-collapse: collapse;
            }
            td{
                border: 1px solid black;
            }
        </style>
        <form action="/author/create_process" method="post">
            <p>
                <input type="text" name="name" placeholder="name">
            </p>
            <p>
                <textarea name="profile" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
      `,
        ``
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    var name = post.name;
    var profile = post.profile;

    db.query(
      `INSERT INTO author (name, profile) 
          VALUES(?, ?)`,
      [name, profile],
      (err, result) => {
        if (err) {
          throw err;
        }
        response.writeHead(302, { Location: `/author` });
        response.end();
      }
    );
  });
};
