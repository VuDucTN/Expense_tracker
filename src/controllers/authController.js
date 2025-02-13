const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already in use!" });

    if (password !== password.trim())
      return res.status(400).json({
        error: "Password should not contain leading or trailing spaces!",
      });

    user = await User.create({ name, username, email, password });

    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user)
      return res.status(400).json({ message: "Username or email not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password!" });

    const session = (req.session.user = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    });

    res.status(200).json({ message: "Login successful!", session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed!" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful!" });
  });
};
