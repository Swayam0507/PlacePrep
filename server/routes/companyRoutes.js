const express = require("express");
const router = express.Router();
const {
  getCompanies, checkEligibility, createCompany, updateCompany, deleteCompany,
} = require("../controllers/companyController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getCompanies);
router.get("/:id/eligibility", protect, checkEligibility);
router.post("/", protect, authorize("admin"), createCompany);
router.put("/:id", protect, authorize("admin"), updateCompany);
router.delete("/:id", protect, authorize("admin"), deleteCompany);

module.exports = router;
