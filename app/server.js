var express = require("express"),
    bodyParser = require("body-parser"),
    logger = require("morgan"),
    mongoose = require("mongoose"),
    Comment = require("./models/Comment.js"),
    Article = require("./models/Article.js"),
    Section = require("./models/Section.js"),
    request = require("request"),
    cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/NYTscrapper");
var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res) {
    request("https://www.nytimes.com/section/science?hpw&rref&action=click&pgtype=Homepage&module=well-region&region=bottom-well&WT.nav=bottom-well", function(error, response, html) {
        var $ = cheerio.load(html);
        $("div.story-body").each(function(i, element) {

            // Save an empty result object
            var obj = new Article();
            // Add the text and href of every link, and save them as properties of the result object
            var layer2 = $(this).children("a")
                .children("div.story-meta");
            obj.link = $(this).children("a").attr("href");
            obj.headline = layer2.children("h2.headline").text().trim();
            obj.summary = layer2.children("p.summary").text();
            obj.author = layer2.children("p.byline").text();
            obj.image = $(this).children("a")
                .children("div.wide-thumb")
                .children("img").attr("src");
            Article.create(obj);

        });
        console.log(result);

    });
    res.send("Check server console for results");
});

app.get("/scrape2", function(req, res) {
    request("https://www.nytimes.com/?action=click&contentCollection=undefined&region=TopBar&module=HomePage-Button&pgtype=sectionfront", function(error, response, html) {
        var $ = cheerio.load(html);
        $("h2.section-heading").each(function(i, element) {
            // Add the text and href of every link, and save them as properties of the result object
            var obj = new Section();
            obj.link = $(this).children("a").attr("href");
            obj.section = $(this).children("a").text().trim();
            if (obj.link !== '' && obj.section !== '') {
                Section.create(obj);
            }
        });
    });
    res.send("Check server console for results");
});


app.get("/articles", function(req, res) {

    Article.find({}, function(error, result) {
        if (error) {
            res.json(error);
        } else {
            res.send(result);
        }
    });
});
app.get("/sections", function(req, res) {

    Section.find({}, function(error, result) {
        if (error) {
            res.json(error);
        } else {
            res.send(result);
        }
    });
});

app.get("/articles/:id", function(req, res) {

    Article.findOne({ "_id": req.params.id }).populate("comment").exec(function(err, result) {
        if (err) {
            res.send(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });

});

app.post("/articles/:id", function(req, res) {
    var newComment = new Comment(req.body);
    newComment.save(function(error, doc) {
        if (error) {
            res.send(error);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comment": doc._id } }, { new: true },
                function(err, data) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(data);
                    }
                });
        }
    });

});

app.listen(3000, function() {
    console.log("App running on port 3000!");
});