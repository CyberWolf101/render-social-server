const mongoose = require("mongoose")
const Schema = mongoose.Schema
const postSchema = new Schema({
    text: {
        type: String,
        default: ''
    },
    userId: {
        type: String,
        required: true
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    userDpUrl: {
        type: String,
        default: ''
    },
    picUrl: {
        type: String,
        default: '',
    },
    mediaUrls: {
        type: [String],
        default: [],
    },
    VideoUrl: {
        type: String,
        default: '',
    },
    userName: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        default: [],
    },
    comments: {
        // type: [
        //     {
        //         userId: String,
        //         text: String,
        //         useDp: String,
        //         likes:[String],
        //         replies: [
        //             {
        //                 userId: String,
        //                 text: String,
        //                 userName: String
        //             }
        //         ]
        //     }
        // ],
        
        // All comments are store in 1 place this will just be keeping count
        type: Number,
        default: 0,
    }
}, { timestamps: true })

const Posts = mongoose.model("posts", postSchema);
module.exports = Posts;
