const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/admin/authController");
const {
  fetchTickets,
  allUsers,
} = require("../controllers/admin/dashboardController");
const authenticate = require("../middleware/adminMiddleware");

router.post("/login", adminLogin);

router.get("/fetchTickets", authenticate, fetchTickets);
router.get("/allUsers", authenticate, allUsers);

module.exports = router;
