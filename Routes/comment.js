const express = require("express");
const router = express.Router();
const {
    addComment,
    fetchCommentsForPost,
    toggleCommentLike
} = require('../controllers/commentController');


router.post("/addComment/:postId", addComment);
router.get("/getComments/:postId", fetchCommentsForPost);
router.put("/toggle-comment-like/:commentId", toggleCommentLike);


module.exports = router;
