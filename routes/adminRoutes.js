const express = require("express");
const router = express.Router();

// Controllers
const { adminLogin, profile } = require("../controllers/admin/authController");
const {
  fetchTickets,
  allUsers,
  getTermsAndConditions,
  getPrivacyPolicy,
  updateTermsAndConditions,
  updatePrivacyPolicy,
  suspendUser,
  blockUser,
  unsuspendUser,
  changePlan,
  updateHomeVideo,
  updateBanner,
  updateAboutUs,
} = require("../controllers/admin/dashboardController");
const uploadHomeVideo = require("../middleware/uploadHomeVideo");

// Middleware
const authenticate = require("../middleware/adminMiddleware");
const { bannerUpload } = require("../middleware/bannerUpload");

// Routes
// Admin Authentication
router.post("/login", adminLogin);

// Terms and Conditions
//router.post("/createTermsAndConditions", authenticate, createTermsAndConditions);
router.get("/getTermsAndConditions", getTermsAndConditions);
router.put("/updateTermsAndConditions", authenticate, updateTermsAndConditions);

// Privacy Policy
//router.post("/createPrivacyPolicy", authenticate, createPrivacyPolicy);
router.get("/getPrivacyPolicy", getPrivacyPolicy);
router.put("/updatePrivacyPolicy", authenticate, updatePrivacyPolicy);

//block and suspend
router.post("/blockUser", authenticate, blockUser);
router.post("/suspendUser", authenticate, suspendUser);
router.post("/unsuspendUser", authenticate, unsuspendUser);

// Other Admin Dashboard Routes
router.get("/fetchTickets", authenticate, fetchTickets);
router.get("/allUsers", authenticate, allUsers);

router.get("/profile", authenticate, profile);
router.post("/change-plan", authenticate, changePlan);

router.put("/updateHomeVideo",uploadHomeVideo, updateHomeVideo);

router.put("/banner/:id", bannerUpload.single("banner"), updateBanner);

router.post("/about-us", updateAboutUs);
module.exports = router;
