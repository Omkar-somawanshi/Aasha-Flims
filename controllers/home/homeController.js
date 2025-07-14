const express = require("express");
const pool = require("../../config/database");
const path = require("path");

const getHomeVideo = async (req, res) => {
  try {
    const [[videoRow] = []] = await pool.query(
      "SELECT video_path, updated_at AS updatedAt FROM homeVideo WHERE id = ?",
      [1]
    );

    // If no video record exists or path is null
    if (!videoRow?.video_path) {
      return res.status(404).json({
        success: false,
        message: "No home video found",
      });
    }

    // Create static URL path (relative)
    const videoUrl = `/uploads/HomeVideo/${videoRow.video_path}`;

    res.status(200).json({
      success: true,
      message: "Home video fetched successfully 🎥",
      video: {
        filename: videoRow.video_path,
        url: videoUrl,
        updatedAt: videoRow.updatedAt,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching home video:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch home video",
      error: err.message,
    });
  }
};

module.exports = {
  getHomeVideo,
};
