const pool = require("../../config/database");
const path = require("path");
const fs = require("fs");

// Helper function to remove file if it exists
function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
}

const fetchTickets = async (req, res) => {
  try {
    // Fetch tickets from the database
    const fetchQuery = `SELECT * FROM tickets`;
    const [tickets] = await pool.query(fetchQuery);

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const allUsers = async (req, res) => {
  try {
    // Fetch tickets from the database
    const fetchQuery = `SELECT * FROM users`;
    const [users] = await pool.query(fetchQuery);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//---------T&C and Privacy Policy-------------------------------------------------------------------------------------------------------------------

// Initialize Terms and Conditions Table
const initializeTermsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS terms_and_conditions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        html_content LONGTEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default row if the table is empty
    const [result] = await pool.query(
      `SELECT COUNT(*) AS count FROM terms_and_conditions`
    );
    if (result[0].count === 0) {
      await pool.query(`
        INSERT INTO terms_and_conditions (html_content) VALUES ('<p>Default Terms and Conditions Content</p>')
      `);
      console.log("Default terms and conditions content inserted");
    }
  } catch (error) {
    console.error("Error initializing terms table:", error);
    throw error;
  }
};

// Initialize Privacy Policy Table
const initializePrivacyTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS privacy_policy (
        id INT AUTO_INCREMENT PRIMARY KEY,
        html_content LONGTEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default row if the table is empty
    const [result] = await pool.query(
      `SELECT COUNT(*) AS count FROM privacy_policy`
    );
    if (result[0].count === 0) {
      await pool.query(`
        INSERT INTO privacy_policy (html_content) VALUES ('<p>Default Privacy Policy Content</p>')
      `);
      console.log("Default privacy policy content inserted");
    }
  } catch (error) {
    console.error("Error initializing privacy table:", error);
    throw error;
  }
};

// Get Current Terms and Conditions
const getTermsAndConditions = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM terms_and_conditions ORDER BY id DESC LIMIT 1"
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No terms and conditions found",
      });
    }

    res.status(200).json({
      success: true,
      content: result[0].html_content,
      lastUpdated: result[0].last_updated,
    });
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch terms and conditions",
      error: error.message,
    });
  }
};

// Get Current Privacy Policy
const getPrivacyPolicy = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM privacy_policy ORDER BY id DESC LIMIT 1"
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No privacy policy found",
      });
    }

    res.status(200).json({
      success: true,
      content: result[0].html_content,
      lastUpdated: result[0].last_updated,
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch privacy policy",
      error: error.message,
    });
  }
};

// Update Operations
// Update Terms and Conditions
const updateTermsAndConditions = async (req, res) => {
  try {
    // Ensure the table exists
    await initializeTermsTable();

    const { html_content } = req.body;

    if (!html_content) {
      return res.status(400).json({
        success: false,
        message: "Invalid content",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM terms_and_conditions LIMIT 1"
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No terms found to update",
      });
    }

    await pool.query(
      "UPDATE terms_and_conditions SET html_content = ? WHERE id = ?",
      [html_content, existing[0].id]
    );

    res.status(200).json({
      success: true,
      message: "Terms and conditions updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update terms",
      error: error.message,
    });
  }
};

// Update Privacy Policy
const updatePrivacyPolicy = async (req, res) => {
  try {
    // Ensure the table exists
    await initializePrivacyTable();

    const { html_content } = req.body;

    if (!html_content) {
      return res.status(400).json({
        success: false,
        message: "Invalid content",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM privacy_policy LIMIT 1"
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No privacy policy found to update",
      });
    }

    await pool.query(
      "UPDATE privacy_policy SET html_content = ? WHERE id = ?",
      [html_content, existing[0].id]
    );

    res.status(200).json({
      success: true,
      message: "Privacy policy updated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update privacy policy",
      error: error.message,
    });
  }
};

const blockUser = async (req, res) => {
  const { userId, block } = req.body;

  if (typeof userId !== "number" || typeof block !== "boolean") {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET blocked = ? WHERE id = ?",
      [block, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User ${block ? "blocked" : "unblocked"} successfully`,
    });
  } catch (error) {
    console.error(`Error blocking/unblocking user (userId: ${userId}):`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const suspendUser = async (req, res) => {
  const { userId, suspendedFrom, suspendedTo } = req.body;

  if (!userId || !Date.parse(suspendedFrom) || !Date.parse(suspendedTo)) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET suspended = ?, suspended_from = ?, suspended_to = ? WHERE id = ?",
      [true, suspendedFrom, suspendedTo, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User suspended from ${suspendedFrom} to ${suspendedTo}`,
    });
  } catch (error) {
    console.error(`Error suspending user (userId: ${userId}):`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const unsuspendUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE users SET suspended = ?, suspended_from = NULL, suspended_to = NULL WHERE id = ?",
      [false, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User unsuspended successfully",
    });
  } catch (error) {
    console.error(`Error unsuspending user (userId: ${userId}):`, error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const changePlan = async (req, res) => {
  const { userId, newPlan } = req.body;

  // Validate input
  if (!userId || !newPlan) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }

  try {
    // Execute the SQL query to update the user's plan
    const [result] = await pool.query(
      "UPDATE users SET plan = ? WHERE id = ?",
      [newPlan, userId]
    );

    // Check if the user exists
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Respond with success
    res.json({ success: true, message: "Plan updated successfully" });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadDir = path.join(process.cwd(), "uploads", "HomeVideo");

/* ------------------------------------------------------------------ */
/*  Ensure table exists and create row #1 if missing                  */
/* ------------------------------------------------------------------ */
async function initHomeVideoTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS homeVideo (
      id          INT PRIMARY KEY AUTO_INCREMENT,
      video_path  VARCHAR(255) DEFAULT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // make sure row id = 1 is present
  const [rows] = await pool.query("SELECT id FROM homeVideo WHERE id = 1");
  if (rows.length === 0) {
    await pool.query("INSERT INTO homeVideo (id, video_path) VALUES (1, NULL)");
  }
}

/* ------------------------------------------------------------------ */
/*  PUT  /api/home-video/:id  (defaults to id = 1)                     */
/* ------------------------------------------------------------------ */
const updateHomeVideo = async (req, res) => {
  let tempFilePath = req.file ? req.file.path : null;
  // id comes from URL; if not provided we fall back to 1
  const videoId = parseInt(req.params.id, 10) || 1;

  try {
    await initHomeVideoTable();

    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded." });
    }

    /* fetch existing row so we know what to delete */
    const [[record] = []] = await pool.query(
      "SELECT video_path FROM homeVideo WHERE id = ?",
      [videoId]
    );

    if (!record) {
      return res.status(404).json({ error: `Row id ${videoId} not found.` });
    }

    /* -----------------------------------------------------------
       1️⃣  Delete the previous video (if any)
           Handles both "video-123.mp4" and
           "/abs/path/uploads/HomeVideo/video-123.mp4"
    ----------------------------------------------------------- */
    if (record.video_path) {
      const oldPath = path.isAbsolute(record.video_path)
        ? record.video_path
        : path.join(uploadDir, record.video_path);

      // Make sure we're not deleting the brand-new file by mistake
      if (oldPath !== tempFilePath) removeIfExists(oldPath);
    }

    const newFilename = req.file.filename;

    /* ---------------------- update DB with new file -------------------- */
    await pool.query("UPDATE homeVideo SET video_path = ? WHERE id = ?", [
      newFilename,
      videoId,
    ]);

    /* ------------ success → prevent cleanup in finally/catch ---------- */
    tempFilePath = null;

    return res.json({
      message: `Video for id ${videoId} updated successfully 🎉`,
      file: newFilename,
    });
  } catch (err) {
    console.error("updateHomeVideo error →", err);

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("Temp file removed ➜", tempFilePath);
      } catch (unlinkErr) {
        console.error("Failed to delete temp file ➜", unlinkErr);
      }
    }

    return res
      .status(500)
      .json({ error: "Server error. Upload rolled back, file deleted." });
  }
};

module.exports = {
  fetchTickets,
  allUsers,
  updateHomeVideo,
  getTermsAndConditions,
  getPrivacyPolicy,
  updateTermsAndConditions,
  updatePrivacyPolicy,
  suspendUser,
  blockUser,
  unsuspendUser,
  changePlan,
};
