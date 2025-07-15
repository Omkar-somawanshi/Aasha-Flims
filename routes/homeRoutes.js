const express = require("express");
const router = express.Router();

// Controllers
const { getHomeVideo , getBanners, getAboutUs} = require("../controllers/home/homeController");

// Routes
router.get("/home-video", getHomeVideo);
router.get("/banners", getBanners);
router.get("/about-us", getAboutUs);

module.exports = router;
