exports.protect = (req, res, next) => {
  if (!req.session.user)
    return res.status(401).json({ message: "You are not logged in!" });

  req.user = req.session.user;
  next();
};
