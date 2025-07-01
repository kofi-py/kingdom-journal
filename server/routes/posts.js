const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/db.json");

// Helper
const readPosts = () => JSON.parse(fs.readFileSync(filePath));
const writePosts = (data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// Routes
router.get("/", (req, res) => res.json(readPosts()));

router.post("/", (req, res) => {
  const posts = readPosts();
  const newPost = { id: Date.now(), ...req.body };
  posts.push(newPost);
  writePosts(posts);
  res.status(201).json(newPost);
});

router.delete("/:id", (req, res) => {
  let posts = readPosts();
  posts = posts.filter((p) => p.id != req.params.id);
  writePosts(posts);
  res.json({ message: "Post deleted" });
});

module.exports = router;
