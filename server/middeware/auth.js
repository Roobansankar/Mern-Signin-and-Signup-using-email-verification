const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

module.exports = async function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

    // Set the user details to the request object
    req.user = await User.findById(decoded._id);

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};
