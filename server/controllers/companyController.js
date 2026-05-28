const Company = require("../models/Company");

/**
 * @desc    Get all companies (paginated, filterable)
 * @route   GET /api/companies?status=upcoming&page=1
 * @access  Private
 */
const getCompanies = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ visitDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Company.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      companies,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
      },
    });
  } catch (error) {
    console.error("Get Companies Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch companies." });
  }
};

/**
 * @desc    Check eligibility for a company
 * @route   GET /api/companies/:id/eligibility
 * @access  Private
 */
const checkEligibility = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });

    const user = req.user;
    const issues = [];

    if (company.eligibility.minCGPA > 0 && user.cgpa < company.eligibility.minCGPA) {
      issues.push(`CGPA ${user.cgpa} below required ${company.eligibility.minCGPA}`);
    }
    if (company.eligibility.branches.length > 0 && !company.eligibility.branches.includes(user.branch)) {
      issues.push(`Branch "${user.branch}" not eligible`);
    }

    res.status(200).json({
      success: true,
      eligible: issues.length === 0,
      issues,
      company: company.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check eligibility." });
  }
};

/**
 * @desc    Create a company (admin)
 * @route   POST /api/companies
 * @access  Private/Admin
 */
const createCompany = async (req, res) => {
  try {
    const company = await Company.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Company added.", company });
  } catch (error) {
    console.error("Create Company Error:", error);
    res.status(500).json({ success: false, message: "Failed to create company." });
  }
};

/**
 * @desc    Update a company (admin)
 * @route   PUT /api/companies/:id
 * @access  Private/Admin
 */
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update company." });
  }
};

/**
 * @desc    Delete a company (admin)
 * @route   DELETE /api/companies/:id
 * @access  Private/Admin
 */
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    res.status(200).json({ success: true, message: "Company deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete company." });
  }
};

module.exports = { getCompanies, checkEligibility, createCompany, updateCompany, deleteCompany };
