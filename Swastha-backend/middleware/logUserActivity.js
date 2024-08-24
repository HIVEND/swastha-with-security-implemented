const Audit = require("../model/audit_model");

const logUserActivity = async (req, res, next) => {
  try {
    const auditData = {
      userId: req.body.userId || (req.session && req.session.user && req.session.user.id), // Use session or body data
      action: req.body.action,
      details: req.body.details,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      timestamp: new Date(),
    };

    if (!auditData.userId) {
      console.log("User ID is undefined. Cannot log activity.");
      return next();
    }

    const newAudit = new Audit(auditData);
    await newAudit.save();
    
    console.log("User activity logged:", auditData); // Log for debugging

    next();
  } catch (error) {
    console.error("Failed to log user activity:", error);
    next(); // Ensure the request is not blocked even if logging fails
  }
};

module.exports = logUserActivity;
