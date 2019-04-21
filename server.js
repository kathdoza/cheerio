var express = require("express");
// var bodyParser = require("body-parser");
var logger = require("morgan");
var cheerio = require("cheerio");
var axios = require("axios");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var app = express();

app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, '/public')));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var databaseUri = "mongodb://localhost/homeworkdb";

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect(databaseUri, { useNewUrlParser: true, useCreateIndex: true });
}

var db = mongoose.connection;

db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function () {
  console.log("Mongoose connection sucessful.");
});


app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// var routes = require("./controllers/articlescontrol");

// app.use(routes);
app.get("/", function (req, res) {
  axios.get("https://www.huffpost.com/").then(function (response) {

    var $ = cheerio.load(response.data);

    var results = [];

    $("a.card__link.yr-card-headline").each(function (i, element) {

      var title = $(element).children().text();
      var link = $(element).attr("href");

      results.push({
        title: title,
        link: link
      });
      Article.create(results)
        .then(function (dbArticle) {
          console.log(dbArticle);
        }).catch(function (err) {
          console.log(err);
        });
    });
    console.log(results);
    cb(results);
  }).then(
    Article.find(function(err, article) {
      res.render("index", {articles: article});
    }));
    //  , function (data) {
      // if (err) {
      //   console.log(err);
      // }
      // else {
      //   res.json(found);
      // }
      // var hbsObject = {
      //   articles: data
      // };
      // console.log(hbsObject);
      // res.render("index", hbsObject);
    // });
});

app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/notes", function(req, res) {
  // Grab every document in the Articles collection
  Note.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/notes/:id", function(req,res) {
  Article.findOne({_id: req.params.id})
  .populate("note") 
  .exec(function (error, doc) { 
      if (error) console.log(error);
      
      else {
          res.json(doc);
      }
  });
});

app.post("/notes/:id", function (req, res) {
  var newNote = new Note(req.body);
  newNote.save(function (err, doc) {
      if (err) console.log(err);
      Article.findOneAndUpdate(
          {_id: req.params.id}, 
          {$push: {note: doc._id}}, 
          {new: true},
          function(err, newdoc){
              if (err) console.log(err);
              res.send(newdoc);
      });
  });
})

app.get("/clearall", function(req, res) {
  // Remove every note from the notes collection
  Note.remove({}, function(error, response) {
    // Log any errors to the console
    if (error) {
      console.log(error);
      res.send(error);
    }
    else {
      // Otherwise, send the mongojs response to the browser
      // This will fire off the success function of the ajax request
      console.log(response);
      res.send(response);
    }
  });
  Article.remove({}), function(err, res) {
    if(err) {
      console.log(err);
      res.send(err);
    }
    else {
      console.log(res);
    }
  }
});


var PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});