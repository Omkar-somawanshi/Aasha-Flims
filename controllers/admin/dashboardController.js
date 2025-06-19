const pool = require("../../config/database");

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

// Create/Update Terms and Conditions
// const createTermsAndConditions = async (req, res) => {
//   try {
//     await initializeTermsTable();
//     const { html_content } = req.body;

//     // Clear existing entries and insert new one
//     await pool.query("TRUNCATE TABLE terms_and_conditions");
//     const [result] = await pool.query(
//       "INSERT INTO terms_and_conditions (html_content) VALUES (?)",
//       [html_content]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Terms and conditions saved successfully",
//       contentId: result.insertId,
//     });
//   } catch (error) {
//     console.error("Error saving terms and conditions:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to save terms and conditions",
//       error: error.message,
//     });
//   }
// };

// // Create/Update Privacy Policy
// const createPrivacyPolicy = async (req, res) => {
//   try {
//     await initializePrivacyTable();
//     const { html_content } = req.body;

//     // Clear existing entries and insert new one
//     await pool.query("TRUNCATE TABLE privacy_policy");
//     const [result] = await pool.query(
//       "INSERT INTO privacy_policy (html_content) VALUES (?)",
//       [html_content]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Privacy policy saved successfully",
//       contentId: result.insertId,
//     });
//   } catch (error) {
//     console.error("Error saving privacy policy:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to save privacy policy",
//       error: error.message,
//     });
//   }
// };

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

//----------------------------------------------------------------------------------------------------------

module.exports = {
  fetchTickets,
  allUsers,
  // createTermsAndConditions,
  // createPrivacyPolicy,
  getTermsAndConditions,
  getPrivacyPolicy,
  updateTermsAndConditions,
  updatePrivacyPolicy,
  suspendUser,
  blockUser,
  unsuspendUser,
};
