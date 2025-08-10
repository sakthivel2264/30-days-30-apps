const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const User = require("../models/User");
const Message = require("../models/Message");

router.post("/register", register);
router.post("/login", login);
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});





module.exports = router;
