const express = require("express");

const router = express.Router();

// Controllers
const {
  registerProduction,
  loginProduction,
  addJobPost,
} = require("../controllers/Production/productionController");
const authenticate = require("../middleware/adminMiddleware");

router.post("/register", registerProduction);
router.post("/login", loginProduction);
router.post("/addJobPost", authenticate, addJobPost);

module.exports = router;
