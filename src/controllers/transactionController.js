const fs = require("fs");
const path = require("path");
const fastCsv = require("fast-csv");
const { parse, isValid, format } = require("date-fns");

const Transaction = require("../models/Transaction");
const User = require("../models/User");

const exportExcel = require("../utils/excelExport");
const exportCsv = require("../utils/csvExport");
const {
  getMonthlyExpense,
  getTotalExpense,
} = require("../services/expenseService");

exports.addTransaction = async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    if (!category || !amount || !description || !date)
      return res
        .status(400)
        .json({ message: "Please enter complete information!" });

    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const trimmedDate = date.trim();

    const parsedDate = parse(trimmedDate, "yyyy-MM-dd", new Date());

    if (!isValid(parsedDate))
      return res
        .status(400)
        .json({ message: "Invalid date format! Use YYYY-MM-DD" });

    const formattedDate = format(parsedDate, "yyyy-MM-dd");

    const transaction = await Transaction.create({
      user: req.user.id,
      category: trimmedCategory,
      amount,
      description: trimmedDescription,
      date: formattedDate,
    });

    res
      .status(201)
      .json({ message: "Add transaction successful!", transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const id = req.params.id;
    const { category, amount, description, date } = req.body;

    const transaction = await Transaction.findById(id);

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found!" });

    if (transaction.user.toString() !== req.user.id)
      return res.status(403).json({
        message: "You do not have permission to delete this transaction!",
      });

    const trimmedCategory = category?.trim() || transaction.category;
    const trimmedDescription = description?.trim() || transaction.description;
    const trimmedDate = date?.trim() || format(transaction.date, "yyyy-MM-dd");

    const parsedDate = parse(trimmedDate, "yyyy-MM-dd", new Date());

    if (!isValid(parsedDate))
      return res
        .status(400)
        .json({ message: "Invalid date format! Use YYYY-MM-DD" });

    const formattedDate = format(parsedDate, "yyyy-MM-dd");

    const UpdateTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        category: trimmedCategory,
        amount: amount || transaction.amount,
        description: trimmedDescription,
        date: formattedDate,
      },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Update transaction successful!", UpdateTransaction });
  } catch (error) {}
};

exports.deleteTransaction = async (req, res) => {
  try {
    const id = req.params.id;

    const transaction = await Transaction.findById(id);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found!" });

    if (transaction.user.toString() !== req.user.id)
      return res.status(403).json({
        message: "You do not have permission to delete this transaction!",
      });

    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction deleted!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { user: req.user.id };

    if (category) {
      filter.category = category;
    }

    const transactions = await Transaction.find(filter)
      .populate("user", "name email username")
      .sort({
        date: -1,
      });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (month) {
      const totalMonthExpenses = await getMonthlyExpense(user._id, month);
      res.json({ totalMonthExpenses });
    } else {
      const totalExpenses = await getTotalExpense(user._id);
      res.json({ totalExpenses });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || "excel";

    const transactions = await Transaction.find({ user: userId }).lean();

    if (!transactions.length)
      return res.status(404).json({ message: "Transaction not found!" });

    const exportDir = path.join(__dirname, "../exports");
    const timestamp = Date.now();

    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    let filePath;
    if (format === "excel") {
      filePath = await exportExcel(transactions, userId, exportDir, timestamp);
    } else if (format === "csv") {
      filePath = await exportCsv(transactions, userId, exportDir, timestamp);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid format! Please select excel or csv." });
    }

    res.download(filePath, `expense-${timestamp}.xlsx`, (err) => {
      if (err) {
        console.log("Error send file!", err);
        res.status(500).json({ message: "Error download file!" });
      }

      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`File deleted after 1 hour: ${filePath}`);
        }
      }, 10000);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error!" });
  }
};
