const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminAnalytics,
  exportReports,
} = require("../controllers/adminController");

// All routes require admin role
router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/analytics", getAdminAnalytics);
router.get("/export", exportReports);

module.exports = router;
