var db = require("./db");
var template = require("./template.js");
var url = require("url");
var qs = require("querystring");
var sanitizedHTML = require("sanitize-html");

exports.home = function (request, response) {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    var title = "Welcome";
    var description = "Hello, Node.js";
    var list = template.list(topics);
    var html = template.HTML(
      title,
      list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
};

exports.page = function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) {
      throw err;
    }
    var query = db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
      [queryData.id],
      (err2, topic) => {
        if (err2) {
          throw err2;
        }
        console.log(topic);
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.HTML(
          sanitizedHTML(title),
          list,
          `<h2>${sanitizedHTML(title)}</h2>
              ${sanitizedHTML(description)}
              <p>by ${sanitizedHTML(topic[0].name)}</p>
              `,

          ` <a href="/create">create</a>
                  <a href="/update?id=${queryData.id}">update</a>
                  <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                  </form>`
        );
        console.log(query.sql);
        response.writeHead(200);
        response.end(html);
      }
    );
  });
};

exports.create = function (request, response) {
  db.query(`SELECT * FROM topic`, (err, topics) => {
    db.query(`SELECT * FROM author`, (err2, authors) => {
      var title = "Create";
      var list = template.list(topics);
      var html = template.HTML(
        sanitizedHTML(title),
        list,
        ` <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  ${template.authorSelect(authors)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>`,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = function (request, response) {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    var title = post.title;
    var description = post.description;

    db.query(
      `INSERT INTO topic (title, description, created, author_id) 
          VALUES(?, ?, NOW(), ?)`,
      [title, description, post.author],
      (err, result) => {
        if (err) {
          throw err;
        }
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};

exports.update = (request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, (err, topics) => {
    if (err) {
      throw err;
    }
    db.query(
      `SELECT * FROM topic WHERE id=?`,
      [queryData.id],
      (err2, topic) => {
        if (err2) {
          throw err2;
        }
        db.query(`SELECT * FROM author`, (err2, authors) => {
          var list = template.list(topics);
          var html = template.HTML(
            sanitizedHTML(topic[0].title),
            list,
            `            
                <form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${topic[0].id}">
                  <p><input type="text" name="title" placeholder="title" value="${sanitizedHTML(
                    topic[0].title
                  )}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${sanitizedHTML(
                      topic[0].description
                    )}</textarea>
                  </p>
                  <p>
                    ${template.authorSelect(authors, topic[0].author_id)}
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
                `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      }
    );
  });
};

exports.update_process = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    var id = post.id;
    var title = post.title;
    var description = post.description;
    db.query(
      `UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
      [title, description, post.author, id],
      (err, result) => {
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      }
    );
  });
};

exports.delete_process = (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var post = qs.parse(body);
    var id = post.id;
    db.query(`DELETE FROM topic WHERE id =?`, [id], (err, result) => {
      if (err) {
        throw err;
      }
      response.writeHead(302, { Location: `/` });
      response.end();
    });
  });
};
