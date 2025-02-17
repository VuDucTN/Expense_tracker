const express = require("express");
const auth = require("./authRoutes");
const transaction = require("./transactionRoutes");

const router = express.Router();

router.use("/auth", auth);
router.use("/transaction", transaction);

module.exports = router;
