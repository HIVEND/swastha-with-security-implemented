const jwt = require("jsonwebtoken");

const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing!",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token Missing!",
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token!",
    });
  }
};

const authGuardAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing!",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token Missing!",
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData;
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token!",
    });
  }
};

module.exports = {
  authGuard,
  authGuardAdmin,
};
