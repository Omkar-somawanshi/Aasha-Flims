const express = require("express");
const router = express.Router();

// Controllers
const { getHomeVideo } = require("../controllers/home/homeController");

// Routes
router.get("/home-video", getHomeVideo);

module.exports = router;
