const fs = require("fs");
const path = require("path");
const fastCsv = require("fast-csv");

const exportCsv = async (transactions, userId, exportDir, timestamp) => {
  const filePath = path.join(exportDir, `expenses-${userId}-${timestamp}.csv`);
  const csvStream = fastCsv.format({ headers: true });
  const writableStream = fs.createWriteStream(filePath);

  return new Promise((resolve, reject) => {
    writableStream.on("finish", () => {
      resolve(filePath);
    });
    writableStream.on("error", (err) => {
      reject(err);
    });

    csvStream.pipe(writableStream);
    transactions.forEach((transaction) => {
      csvStream.write({
        Category: transaction.category,
        Amount: transaction.amount,
        Description: transaction.description,
        Date: transaction.date.toISOString().split("T")[0],
      });
    });

    csvStream.end();
  });
};

module.exports = exportCsv;
