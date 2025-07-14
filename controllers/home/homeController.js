const getHomeVideo = async (req, res) => {
  try {
    const [[videoRow] = []] = await pool.query(
      "SELECT video_path, updated_at FROM homeVideo WHERE id = 1"
    );

    if (!videoRow || !videoRow.video_path) {
      return res.status(404).json({
        success: false,
        message: "No home video found",
      });
    }

    const videoUrl = `/uploads/HomeVideo/${videoRow.video_path}`;

    res.status(200).json({
      success: true,
      message: "Home video fetched successfully",
      video: {
        filename: videoRow.video_path,
        url: videoUrl,
        updatedAt: videoRow.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching home video:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch home video",
      error: error.message,
    });
  }
};
