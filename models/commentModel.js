// commentModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    postId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    userDp: {
        type: String,
        default: '',
    },
    likes: {
        type: [String],
        default: [],
    },
    replies: [
        {
            userId: String,
            text: String,
            userName: String,
        }
    ],
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;


