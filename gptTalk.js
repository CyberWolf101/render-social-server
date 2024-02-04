const Chat = require('../models/chatModel');
const { userSocketIdMap, io } = require('../server') 

// Function to get chat history for a specific user pair



// Function to send a new message
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text, senderUserName, receiverUserName, dpUrl, receiverName, senderName } = req.body;

        // Check for an existing chat document in either direction
        const chat = await Chat.findOneAndUpdate(
            {
                $or: [
                    { 'users.senderId': senderId, 'users.receiverId': receiverId },
                    { 'users.senderId': receiverId, 'users.receiverId': senderId },
                ],
            },

            {
                $push: {
                    messages: {
                        senderId,
                        receiverId,
                        senderUserName,
                        receiverUserName,
                        text,
                        dpUrl,
                    },
                },
                'users.senderId': senderId,
                'users.senderName': senderUserName,
                'users.receiverId': receiverId,
                'users.receiverName': receiverUserName,
            },
            { upsert: true, new: true }
        );

        console.log('userSocketIdMap',userSocketIdMap)
        console.log('receiverId',receiverId)
        const receiverSocketId = userSocketIdMap[receiverId];
        console.log('receiverSocketId',receiverSocketId)
        io.to(receiverSocketId).emit("newMessage", { chat });
        // Return the updated chat document
        res.status(200).json({ chat });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





module.exports = {
    sendMessage,
};

