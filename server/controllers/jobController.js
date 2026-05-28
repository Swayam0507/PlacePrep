const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * @desc    Get job recommendations based on skills and scores
 * @route   POST /api/jobs/recommend
 * @access  Private
 */
const recommendJobs = async (req, res) => {
  try {
    const { skills, scores } = req.body;

    const response = await axios.post(`${ML_SERVICE_URL}/api/jobs/recommend/`, {
      skills: skills || [],
      scores: scores || {},
    });

    res.status(200).json({
      success: true,
      count: response.data.count,
      recommendations: response.data.recommendations,
    });
  } catch (error) {
    console.error("Job Recommend Error:", error.response?.data || error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.error || "Job recommendation service error",
      });
    }

    res.status(503).json({
      success: false,
      message: "ML service is unavailable.",
    });
  }
};

/**
 * @desc    Scrape latest job/internship listings
 * @route   GET /api/jobs/scrape
 * @access  Private
 */
const scrapeJobs = async (req, res) => {
  try {
    const { query, location, limit } = req.query;

    const response = await axios.get(`${ML_SERVICE_URL}/api/jobs/scrape/`, {
      params: { query, location, limit },
    });

    res.status(200).json({
      success: true,
      count: response.data.count,
      query: response.data.query,
      jobs: response.data.jobs,
    });
  } catch (error) {
    console.error("Job Scrape Error:", error.response?.data || error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.error || "Job scraping service error",
      });
    }

    res.status(503).json({
      success: false,
      message: "ML service is unavailable.",
    });
  }
};

module.exports = { recommendJobs, scrapeJobs };
