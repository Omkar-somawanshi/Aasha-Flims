const { registerUser, loginUser , getUserProfile,createTicket } = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");
const express = require("express");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/profile', userAuth, getUserProfile);
router.post('/createTicket', createTicket);

module.exports = router;
