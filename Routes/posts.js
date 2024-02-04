const express = require("express");
const cloudinary = require('cloudinary').v2;
// const cloudinary = require('cloudinary');
const multer = require('multer');
const Posts = require('../models/postModel');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();
const {
    createPost,
    getAllPosts,
    getSinglePost,
    deletePost,
    updatePost,
    getUserPosts,
    togglePostVisibility,
    toggleLikePost,
    toggleLikePostForMapped,
    getPostsPaginated,
} = require('../controllers/postsController');
// const upload = require('../middleware/upload')


cloudinary.config({
    cloud_name: 'dfdnuay65',
    api_key: '845648699234787',
    api_secret: '9MzfyKj2021VjQuzqEuunAsk19o',
});


// Configure Multer (for file upload)
const Storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage: Storage
})
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     allowedFormats: ['jpg', 'png', 'jpeg', 'mp4', 'avi', 'mov'],
// });
// const upload = multer({ storage });


router.post('/createPost', upload.array('files'), async (req, res) => {
    const { text, userId, userName, dpUrl } = req.body;
    const files = req.files;

    try {
        console.log('files: ___', files)
        console.log('text:___', text)
        console.log('userId:___', userId)
        console.log('userName:___', userName)

        let mediaUrls = [];

        if (files && files.length > 0 && files !== null) {
            // Upload each file to Cloudinary concurrently
            const uploadPromises = files.map(async (file) => {
                return await cloudinary.uploader.upload(file.path, {
                    resource_type: 'auto',
                });
            });


            // Wait for all uploads to finish and collect URLs
            const uploadResults = await Promise.all(uploadPromises);
            mediaUrls = uploadResults.map((result) => result.secure_url);
        }

        const userDpUrl = dpUrl

        // Create a new post
        const newPost = await Posts.create({
            text,
            userId,
            userName,
            mediaUrls,
            userDpUrl,
        });

        console.log('Post created successfully:', newPost);

        // Return the created post in the response
        res.status(201).json(newPost);
    } catch (error) {
        // Log detailed error message
        console.error('Error creating post:', error);

        // Handle errors
        res.status(500).json({ error: 'Error creating post in the database' });
    }
});

router.get("/getAllPosts", getAllPosts);

// router.get("/getAllPosts", getPostsPaginated);


router.post('/toggle-like-mapped/:postId', toggleLikePostForMapped);

router.post('/toggle-like/:postId', toggleLikePost);

router.get('/getUserPosts/:userId', getUserPosts);

router.delete("/deletePost/:id", deletePost);

router.get("/getSinglePost/:id", getSinglePost);

router.put("/updatePost/:id", updatePost);

router.put('/toggleVisibility/:id', togglePostVisibility);


module.exports = router;
