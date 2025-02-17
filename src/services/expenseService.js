const Transaction = require("../models/Transaction");

const expenseCategories = ["Ăn uống", "Giải trí", "Thuê nhà", "Khác"];

const getMonthlyExpense = async (userId, month) => {
  const year = new Date().getFullYear();

  let nextMonth = parseInt(month) + 1;
  let nextYear = year;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = year + 1;
  }

  const totalMonthlyExpenses = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        category: { $in: expenseCategories },
        date: {
          $gte: new Date(`${year}-${month}-01`),
          $lt: new Date(`${nextYear}-${nextMonth}-01`),
        },
      },
    },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);

  return totalMonthlyExpenses[0]?.totalAmount || 0;
};

const getTotalExpense = async (userId) => {
  const totalExpenses = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        category: { $in: expenseCategories },
      },
    },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  return totalExpenses[0]?.totalAmount || 0;
};

module.exports = { getMonthlyExpense, getTotalExpense };
