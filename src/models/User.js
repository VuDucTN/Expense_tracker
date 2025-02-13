const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: {
      type: String,
      required: [true, "Username cannot be empty!"],
      unique: [true, "Username already in use"],
    },
    email: {
      type: String,
      required: [true, "Email cannot be empty!"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid Email!"],
    },
    password: {
      type: String,
      required: [true, "Password cannot be empty!"],
      minLength: [6, "Password must be at least 6 characters!"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
