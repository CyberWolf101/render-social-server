const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Posts = require('../models/postModel');
const User = require('../models/userModel');

// Use environment variables for Cloudinary credentials
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
cloudinary.config({
    cloud_name: 'dfdnuay65',
    api_key: '845648699234787',
    api_secret: '9MzfyKj2021VjQuzqEuunAsk19o',
});
const Storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '../uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage: Storage
})


const createPost = async (req, res) => {
    const { text, userId, userName, dpUrl } = req.body;
    const files = req.files;  // Corrected line

    try {
        // Check if any files are uploaded
        let mediaUrls = [];
        console.log('_________FILES____________:', files);

        if (files && files.length > 0) {
            // Upload each file to Cloudinary concurrently
            const uploadPromises = files.map(async (file) => {
                return await cloudinary.uploader.upload(file.buffer.toString('base64'), {
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
            userDpUrl
            // other fields...
        });

        // Log success message
        console.log('Post created successfully:', newPost);

        // Return the created post in the response
        res.status(201).json(newPost);
    } catch (error) {
        // Log detailed error message
        console.error('Error creating post:', error);

        // Handle errors
        res.status(500).json({ error: 'Error creating post in the database' });
    }
};



// Controller method to handle post liking or unliking for mappedPost
const toggleLikePostForMapped = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        // Check if the post exists
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has already liked the post
        const indexOfUser = post.likes.indexOf(userId);
        if (indexOfUser !== -1) {
            // User has already liked the post, so unlike it
            post.likes.splice(indexOfUser, 1);
        } else {
            // User has not liked the post, so like it
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({ success: 'thePost', post: post });
    } catch (error) {
        console.error('Error toggling like/unlike:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller method to handle post liking or unliking

const toggleLikePost = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        // Check if the post exists
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has already liked the post
        const indexOfUser = post.likes.indexOf(userId);
        if (indexOfUser !== -1) {
            // User has already liked the post, so unlike it
            post.likes.splice(indexOfUser, 1);
        } else {
            // User has not liked the post, so like it
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({ success: 'Toggle like/unlike successful', likes: post.likes });
    } catch (error) {
        console.error('Error toggling like/unlike:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// const getAllPosts = async (req, res) => {
//     try {
//         const allPosts = await Posts.find();
//         res.status(200).send(allPosts);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };


const getPostsPaginated = async (req, res) => {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const pageSize = parseInt(req.query.pageSize) || 1;

        // Retrieve posts with infinite scrolling
        const allPosts = await Posts.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize);

        res.status(200).send(allPosts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const ITEMS_PER_PAGE = 2;

const getAllPosts = async (req, res) => {
    try {
        const { skip = 0 } = req.query;
        const posts = await Posts.find()
        const randomPosts = shuffleArray(posts)
        const postLength = posts.length
        const shuffledPosts = randomPosts.slice(0, 2)

        const allPosts = await Posts.find().sort({ createdAt: -1 }).skip(parseInt(skip)).limit(ITEMS_PER_PAGE);

        res.status(200).send({ allPosts, postLength, shuffledPosts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}









const getUserPosts = async (req, res) => {
    const userId = req.params.userId;
    try {
        const userPosts = await Posts.find({ userId }).sort({ createdAt: -1 });

        if (!userPosts || userPosts.length === 0) {
            return res.status(201).json({ error: 'You have not made any post' });
        }

        res.status(200).json(userPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getSinglePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).send(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deletePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Posts.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the post has media URLs
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            // Delete media from Cloudinary
            const deleteMediaPromises = post.mediaUrls.map(async (mediaUrl) => {
                const publicId = mediaUrl.split('/').pop().split('.')[0];
                console.log(publicId)
                const res1 = await cloudinary.uploader.destroy(publicId);
                console.log('res1', res1)

            });

            // Wait for all media deletions to finish
            await Promise.all(deleteMediaPromises);

        }

        // Delete the post from the database
        const deletedPost = await Posts.findByIdAndDelete(postId);

        res.status(200).json(deletedPost);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting post' });
    }
};



const updatePost = async (req, res) => {
    const { text, userId, userName } = req.body;
    try {
        const updatedPost = await Posts.findByIdAndUpdate(
            req.params.id,
            { text, userId, userName },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).send(updatedPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const togglePostVisibility = async (req, res) => {
    const postId = req.params.id;

    try {
        // Find the post by ID
        const post = await Posts.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Toggle the isVisible field
        post.isVisible = !post.isVisible;

        // Save the updated post
        await post.save();

        res.status(200).json({ message: 'Post visibility toggled successfully', post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
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
    
};
