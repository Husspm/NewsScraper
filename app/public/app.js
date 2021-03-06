$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
        var col;
        if (i % 2 === 0) {
            col = 1;
        } else {
            col = 2;
        }
        $("#articles").append("<div class='article-wrap" + col + "'><p data-id='" + data[i]._id + "'>" +
            "<div class='words-wrap'><a class='linkAdjust' target='_black' href=" + data[i].link + "><h2>" + data[i].headline + "</h2></a>" +
            "<p>" + data[i].summary + "</p>" +
            "<h4>" + data[i].author + "</h4></div>" +
            "<div class='image-wrap'><img src=" + data[i].image + "></div></div>");
    }
});
$.getJSON("/sections", function(data) {
    for (var i = 0; i < data.length; i++) {
        $("#sections").append("<div class='section-wrap'><p data-id='" + data[i]._id + "'>" +
            "<div class='words-wrap'><a class='linkAdjust' target='_black' href=" + data[i].link +
            "><p>" + data[i].section + "</p></a></div></div>");
    }
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .done(function(data) {
            console.log(data);
            // The title of the article
            $("#notes").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#notes").append("<input id='titleinput' name='title' >");
            // A textarea to add a new note body
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            console.log(data);
            // If there's a note in the article
            if (data.comment) {
                var a = $("h2").text(data.comment[0].title);
                var b = $("h2").text(data.comment[0].body);
                var c = $("h2").text(data.comment[0]._id);
                $("body").append(a, b);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});