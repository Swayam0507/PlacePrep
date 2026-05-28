const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * @desc    Predict placement probability
 * @route   POST /api/ml/predict
 * @access  Private
 */
const predictPlacement = async (req, res) => {
  try {
    const {
      cgpa,
      aptitude_score,
      coding_score,
      communication_score,
      attendance,
      projects_count,
      internships_count,
    } = req.body;

    // Forward to ML microservice
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/predict/`, {
      cgpa,
      aptitude_score,
      coding_score,
      communication_score,
      attendance,
      projects_count,
      internships_count,
    });

    res.status(200).json({
      success: true,
      data: response.data.data,
    });
  } catch (error) {
    console.error("ML Predict Error:", error.response?.data || error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.error || "ML service error",
      });
    }

    res.status(503).json({
      success: false,
      message: "ML service is unavailable. Please ensure it is running on port 8000.",
    });
  }
};

module.exports = { predictPlacement };
