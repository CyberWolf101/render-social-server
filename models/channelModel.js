const mongoose = require("mongoose")
const Schema = mongoose.Schema
const channelModel = new Schema({
    text: {
        type: String,
        required: true
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
    mediaUrl: {
        type: String,
        default: '',
    },
    userName: {
        type: String,
        required: true
    },
    cloudinary_public_id: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        default: [],
    },
    usersViewed: {
        type: [String],
        default: [],
    },
    comments: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Number,
        required: true
    },
    expirationTime: {
        type: Number,
        default: 0
    },
    isChannel: {
        type: Boolean,
        required: true
    }
}, { timestamps: true })

const Channel = mongoose.model("channel", channelModel);
module.exports = Channel;
