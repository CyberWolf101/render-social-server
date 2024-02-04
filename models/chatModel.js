const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({

    users: {
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        receiverId: { type: String, required: true },
        receiverName: { type: String, required: true },
    },
    messages: [
        {
            senderId: { type: String, required: true },
            receiverId: { type: String, required: true },
            senderUserName: { type: String, requred: true },
            receiverUserName: { type: String, requred: true },
            text: { type: String, required: true },
            timestamp: { type: Number, default: Date.now },
            dpUrl: { type: String },
            read: { type: Boolean, default: false },
            mediaUrls: {
                type: [String],
                default: [],
            },
        },
    ],
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
