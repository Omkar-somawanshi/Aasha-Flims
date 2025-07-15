const fs = require("fs");

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Failed to delete file ➜", err);
    }   
  }
}

module.exports = removeIfExists;
