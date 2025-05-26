const express = require("express");
const router = express.Router();

// Controllers
const { adminLogin } = require("../controllers/admin/authController");
const {
  fetchTickets,
  allUsers,
  createTermsAndConditions,
  createPrivacyPolicy,
  getTermsAndConditions,
  getPrivacyPolicy,
  updateTermsAndConditions,
  updatePrivacyPolicy,
} = require("../controllers/admin/dashboardController");

// Middleware
const authenticate = require("../middleware/adminMiddleware");
const upload = require("../middleware/imgUpload");

// Routes
// Admin Authentication
router.post("/login", adminLogin);

// Terms and Conditions
router.post(
  "/createTermsAndConditions",
  authenticate,
  createTermsAndConditions
);
router.get("/getTermsAndConditions", authenticate, getTermsAndConditions);
router.put(
  "/updateTermsAndConditions",
  authenticate,
  updateTermsAndConditions
);

// Privacy Policy
router.post("/createPrivacyPolicy", authenticate, createPrivacyPolicy);
router.get("/getPrivacyPolicy", authenticate, getPrivacyPolicy);
router.put("/updatePrivacyPolicy", authenticate, updatePrivacyPolicy);

// Other Admin Dashboard Routes
router.get("/fetchTickets", authenticate, fetchTickets);
router.get("/allUsers", authenticate, allUsers);


module.exports = router;
