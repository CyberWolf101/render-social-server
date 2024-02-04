const Chat = require('../models/chatModel');
const path = require('path');
const { userSocketIdMap, io } = require('../server')






// Function to get chat history for a specific user pair
const getChatHistory = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Check for a chat document in either direction
        const chat = await Chat.findOne({
            $or: [
                { 'users.senderId': senderId, 'users.receiverId': receiverId },
                { 'users.senderId': receiverId, 'users.receiverId': senderId },
            ],
        });

        if (!chat) {
            return res.json({ chatRoomExists: false });
        }

        // Return the chat history
        res.status(200).json({ chat, chatRoomExists: true });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// Function to get a user's recent chats
const getRecentChats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all recent chats for each user pair involving the specified user
        const recentChats = await Chat.find({
            $or: [
                { 'users.senderId': userId },
                { 'users.receiverId': userId },
            ],
        })
            .sort({ 'messages.timestamp': -1 }) // Sort by timestamp in descending order
            .populate('users.senderId', 'senderUserName senderDpUrl') // Populate sender details
            .populate('users.receiverId', 'receiverUserName receiverDpUrl'); // Populate receiver details

        // Return the recent chats
        res.status(200).json({ recentChats });
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    getChatHistory,
    getRecentChats,
};

