const express = require("express");
const router = express.Router();
const {
    getChatHistory,
    getRecentChats,
} = require('../controllers/chatController');


router.get("/get-chat/:senderId/:receiverId", getChatHistory);
router.get("/recent-chats/:userId", getRecentChats);


module.exports = router;
