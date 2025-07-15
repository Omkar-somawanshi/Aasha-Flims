const express = require("express");
const pool = require("../../config/database");
const path = require("path");

/* ------------------------------------------------- */
/*  GET  /api/home‑video                             */
/* ------------------------------------------------- */
const getHomeVideo = async (req, res) => {
  try {
    const [[videoRow] = []] = await pool.query(
      `SELECT video_path,
              updated_at AS updatedAt
         FROM homeVideo
        WHERE id = ?`,
      [1]
    );

    if (!videoRow?.video_path) {
      return res.status(404).json({
        success: false,
        message: "No home video found",
      });
    }

    // 🔗 absolute URL → http(s)://host/uploads/HomeVideo/filename.mp4
    const videoUrl = `${req.protocol}://${req.get("host")}/uploads/HomeVideo/${
      videoRow.video_path
    }`;

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

/* ------------------------------------------------- */
/*  GET  /api/banners                                */
/* ------------------------------------------------- */
const getBanners = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id,
              image_path,
              updated_at AS updatedAt
         FROM banners
     ORDER BY id ASC`
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No banners found",
      });
    }

    // 🌐 Base URL for all banner images
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/banners/`;

    // Map DB rows → clean objects with full URL
    const banners = rows.map((b) => ({
      id: b.id,
      filename: b.image_path,
      url: `${baseUrl}${b.image_path}`,
      updatedAt: b.updatedAt,
    }));

    res.status(200).json({
      success: true,
      message: "Banners fetched successfully 🖼️",
      banners,
    });
  } catch (err) {
    console.error("❌ getBanners error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: err.message,
    });
  }
};

const getAboutUs = async (req, res) => {
  try {
    const [[row] = []] = await pool.query(
      "SELECT html_content, updated_at FROM about_us WHERE id = 1"
    );

    if (!row?.html_content) {
      return res.status(404).json({
        success: false,
        message: "No About Us content found",
      });
    }

    res.status(200).json({
      success: true,
      message: "About Us content fetched successfully 🙌",
      aboutUs: {
        html: row.html_content,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching About Us:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch About Us content",
      error: err.message,
    });
  }
};

module.exports = {
  getHomeVideo,
  getBanners,
  getAboutUs,
};
