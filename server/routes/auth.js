const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const users = []; // In-memory user store for demo. Use DB in production!
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is not set.");
}

// Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = users.find((u) => u.username === username);
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.status(201).json({ message: "Signup successful" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

module.exports = router;
