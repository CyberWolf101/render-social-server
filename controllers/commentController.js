// commentController.js
const Comment = require('../models/commentModel');
const Posts = require('../models/postModel');
const User = require('../models/userModel');

// Controller method to add a comment to a post
const addComment = async (req, res) => {
    const { postId } = req.params;
    const { userId, text, userDp, name } = req.body;

    const post = await Posts.findById(postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }


    //

    try {
        // Create a new comment
        const newComment = new Comment({
            postId,
            userId,
            text,
            userDp,
            name
        });

        // Save the comment
        await newComment.save();

        const postCommentsCount = post.comments
        let updatedCount
        if (postCommentsCount >= 0) {
            updatedCount = postCommentsCount + 1
        } else {
            updatedCount = 1

        }
        post.comments = updatedCount
        await post.save()

        res.status(201).json({ success: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Controller method to fetch comments for a post
const fetchCommentsForPost = async (req, res) => {
    const { postId } = req.params;
    try {
        // Fetch comments for the specified post
        const comments = await Comment.find({ postId }).sort({ createdAt: 'desc' });

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





const toggleCommentLike = async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body;

    try {
        // Find the comment by its ID
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user has already liked the comment
        const isLiked = comment.likes.includes(userId);

        if (isLiked) {
            // If liked, remove the user's like
            comment.likes = comment.likes.filter((id) => id !== userId);
        } else {
            // If not liked, add the user's like
            comment.likes.push(userId);
        }

        // Save the updated comment
        await comment.save();

        res.status(200).json({ success: 'Like toggled successfully', comment });
    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = { addComment, fetchCommentsForPost, toggleCommentLike };
