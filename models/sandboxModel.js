const mongoose = require("mongoose")
const Schema = mongoose.Schema
const sandBoxSchema = new Schema({
    first: {
        type: String,
        required: true
    },
    second: {
        type: String,
        required: true
    },
    third: {
        type: String,
        required: true
    },
}, { timestamps: true })

const sandBox = mongoose.model("sandbox", sandBoxSchema);
module.exports = sandBox;
