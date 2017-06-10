var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SectionSchema = new Schema({
    section: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    }
});

var Section = mongoose.model("Section", SectionSchema);

module.exports = Section;