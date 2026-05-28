const express = require("express");
const router = express.Router();
const {
  getPosts, getPost, createPost, deletePost, upvotePost, addReply, togglePin,
} = require("../controllers/forumController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getPosts);
router.get("/:id", protect, getPost);
router.post("/", protect, createPost);
router.delete("/:id", protect, deletePost);
router.post("/:id/upvote", protect, upvotePost);
router.post("/:id/reply", protect, addReply);
router.put("/:id/pin", protect, authorize("admin"), togglePin);

module.exports = router;
