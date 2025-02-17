const ExcelJS = require("exceljs");
const path = require("path");

const exportExcel = async (transactions, userId, exportDir, timestamp) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  worksheet.columns = [
    { header: "Category", key: "category", width: 20 },
    { header: "Amount", key: "amount", width: 15 },
    { header: "Description", key: "description", width: 30 },
    { header: "Date", key: "date", width: 15 },
  ];

  transactions.forEach((transaction) => {
    worksheet.addRow({
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.toISOString().split("T")[0],
    });
  });

  worksheet.getRow(1).font = { bold: true };

  const filePath = path.join(exportDir, `expenses-${userId}-${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
};

module.exports = exportExcel;
