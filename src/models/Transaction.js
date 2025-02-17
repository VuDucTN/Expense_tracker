const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Ăn uống", "Giải trí", "Thuê nhà", "Khác"],
    },
    amount: { type: Number, require: true },
    description: { type: String, default: "" },
    date: { type: Date, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
