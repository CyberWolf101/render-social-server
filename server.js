const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require('./Routes/user');
const sandBoxRouter = require('./Routes/sandBox');
const momentsRouter = require('./Routes/moments');
const channelsRouter = require('./Routes/channel');
const postsRouter = require('./Routes/posts');
const commentsRouter = require('./Routes/comment');
const chatsRouter = require('./Routes/chats');
require("dotenv").config();
const http = require("http");
// const socketIO = require("socket.io");
const Chat = require("./models/chatModel");
const { Server } = require('socket.io')
app.use(cors());
app.set("view engine", "ejs");
app.use(express.static("public"));
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// might delete
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// might delete

app.use(express.json());

cloudinary.config({
    cloud_name: 'dfdnuay65',
    api_key: '845648699234787',
    api_secret: '9MzfyKj2021VjQuzqEuunAsk19o',
});
const Storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage: Storage
})

// Create HTTP server after setting up middleware
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"],
    }
});

// User Socket ID Map
const userSocketIdMap = {};

// Set up a connection event for Socket.io
io.on("connection", (socket) => {
    // console.log("A user connected");
    // console.log(socket.id);

    // Assuming you have access to the userId during connection
    const userId = socket.handshake.query.userId;
    // Connect the user and update userSocketIdMap
    userSocketIdMap[userId] = socket.id;
    // console.log(`User connected with socket ID: ${socket.id}, User ID: ${userId}`);
    // console.log(userSocketIdMap)

    socket.on("newMessage", (chat) => {
        // Get the receiver's socket ID from userSocketIdMap
        const receiverSocketId = userSocketIdMap[chat.receiverId];
        // console.log('Received newMessage event:', chat);

        // Emit the message to the receiver's socket
        socket.to(receiverSocketId).emit('recieve_message', chat);
    })

    // Handle disconnection events
    socket.on('disconnect', () => {
        // console.log(`User disconnected with User ID: ${userId}`);
        delete userSocketIdMap[userId];
    });
});

io.on("error", (error) => {
    console.error('Socket.io error:', error);
});

app.post("/chats/send-message", upload.array('files'), async (req, res) => {
    try {
        const { senderId, receiverId, text, senderUserName, receiverUserName, dpUrl } = req.body;
        const files = req.files;

        console.log(files)
        console.log(senderId)
        // Validate required fields
        if (!senderId || !receiverId || !senderUserName || !receiverUserName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let mediaUrls = [];
        if (files && files.length > 0 && files !== null) {
            // Upload each file to Cloudinary concurrently
            const uploadPromises = files.map(async (file) => {
                return await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                });
            });


            const uploadResults = await Promise.all(uploadPromises);
            mediaUrls = uploadResults.map((result) => result.secure_url);
        }
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
                        mediaUrls
                    },
                },
                'users.senderId': senderId,
                'users.senderName': senderUserName,
                'users.receiverId': receiverId,
                'users.receiverName': receiverUserName,
            },
            { upsert: true, new: true }
        );

        // console.log('userSocketIdMap', userSocketIdMap);
        // console.log('receiverId', receiverId);

        // const receiverSocketId = userSocketIdMap[receiverId];
        // // console.log('receiverSocketId', receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('recieve_message', chat);
        } else {
            console.error('Receiver socket ID is undefined. Cannot emit message.');
        }

        // Return the updated chat document
        res.status(200).json({ chat });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.use("/channels", channelsRouter);
app.use("/moments", momentsRouter);
app.use("/comments", commentsRouter);
app.use("/chats", chatsRouter);
app.use("/posts", postsRouter);
app.use("/user", userRouter);

mongoose.connect(process.env.DATAURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log("Database connected & server listening on port", process.env.PORT + "...");
            // Export userSocketIdMap and io only after successful database connection and server start
        });
    }).catch((err) => {
        console.log(err.message);
    });
