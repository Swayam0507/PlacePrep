const Resume = require("../models/Resume");
const path = require("path");
const fs = require("fs");

// Simple keyword-based resume skill extraction
const SKILL_KEYWORDS = [
  // Programming Languages
  "javascript", "python", "java", "c++", "c#", "typescript", "ruby", "php",
  "swift", "kotlin", "go", "rust", "scala", "r", "matlab", "dart",
  // Web
  "html", "css", "react", "angular", "vue", "node.js", "express", "django",
  "flask", "spring", "nextjs", "tailwind", "bootstrap", "jquery", "sass",
  // Database
  "mysql", "postgresql", "mongodb", "redis", "firebase", "sqlite", "oracle",
  "dynamodb", "cassandra", "elasticsearch",
  // Cloud & DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "github",
  "ci/cd", "terraform", "ansible", "linux", "nginx",
  // Data & ML
  "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
  "numpy", "scikit-learn", "nlp", "computer vision", "data analysis",
  "power bi", "tableau", "sql", "data science",
  // Tools & Concepts
  "rest api", "graphql", "microservices", "agile", "scrum", "jira",
  "figma", "postman", "vs code",
];

/**
 * Extract skills from raw text content (basic keyword matching)
 */
const extractSkills = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = [];
  for (const skill of SKILL_KEYWORDS) {
    if (lowerText.includes(skill) && !found.includes(skill)) {
      // Capitalize nicely
      found.push(skill.replace(/\b\w/g, (c) => c.toUpperCase()));
    }
  }
  return found;
};

/**
 * @desc    Upload resume
 * @route   POST /api/resume/upload
 * @access  Private
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    const { skills, education } = req.body;

    // Parse skills from comma-separated input or empty
    let skillsList = [];
    if (skills) {
      skillsList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      skills: skillsList,
      education: education || "",
      parsed: skillsList.length > 0,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully!",
      resume,
    });
  } catch (error) {
    console.error("Upload Resume Error:", error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: "Failed to upload resume.",
    });
  }
};

/**
 * @desc    Get all resumes for current user
 * @route   GET /api/resume/my-resumes
 * @access  Private
 */
const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("Get Resumes Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resumes.",
    });
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resume/:id
 * @access  Private
 */
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    // Delete file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await Resume.deleteOne({ _id: resume._id });

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Resume Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resume.",
    });
  }
};

/**
 * @desc    Parse/extract skills from an uploaded resume (simulated)
 * @route   POST /api/resume/:id/parse
 * @access  Private
 */
const parseResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    // For now, use the skills provided in the request or simulate extraction
    const { skills, education } = req.body;

    if (skills && Array.isArray(skills)) {
      resume.skills = skills;
    }
    if (education) {
      resume.education = education;
    }
    resume.parsed = true;

    await resume.save();

    res.status(200).json({
      success: true,
      message: "Resume parsed successfully.",
      resume,
    });
  } catch (error) {
    console.error("Parse Resume Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to parse resume.",
    });
  }
};

module.exports = { uploadResume, getMyResumes, deleteResume, parseResume };
