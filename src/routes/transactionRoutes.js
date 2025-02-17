const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getTransaction,
  getExpenseSummary,
  exportTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.post("/add", protect, addTransaction);
router.patch("/update/:id", protect, updateTransaction);
router.delete("/delete/:id", protect, deleteTransaction);

router.get("/export", protect, exportTransactions);
router.get("/total", protect, getExpenseSummary);
router.get("/", protect, getTransaction);

module.exports = router;
