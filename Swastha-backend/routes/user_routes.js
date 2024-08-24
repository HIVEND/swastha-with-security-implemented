// Import necessary modules
const router = require("express").Router();
const user_controller = require("../controllers/user_controller");
const { authGuard } = require("../middleware/authGuard");
const logUserActivity = require("../middleware/logUserActivity");
const Audit = require("../model/audit_model");

// Route to change password, requires authentication
router.put('/change/:userId',logUserActivity, authGuard, user_controller.changePassword);

// Route to register a new user
router.post("/register", user_controller.createUser);

// Route to login, includes logging user activity
router.post("/login", logUserActivity, user_controller.loginUser);

// Route to request password reset, no authentication required
router.post("/forgot/password", user_controller.forgotPassword);

// Route to reset password, logs activity
// router.put("/reset", logUserActivity, user_controller.resetPassword);

// Route to get all users, accessible without authentication (modify if needed)
router.get("/getUsers", user_controller.getUsers);

// Route to get a single user by ID, accessible without authentication (modify if needed)
router.get("/getUser/:id", user_controller.getSingleUser);

// Route to delete a user by ID, accessible without authentication (modify if needed)
router.delete("/deleteUser/:id", user_controller.deleteUser);

// Route to get paginated users, accessible without authentication (modify if needed)
router.get("/getPagination", user_controller.getPagination);

// Route to update user profile, includes logging user activity and requires authentication
router.put('/profile/:id', authGuard, logUserActivity, user_controller.updateUserProfile);

// Route to get audit trail by userId
router.get('/audits/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Ensure the userId is valid
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Fetch the audit logs for the specified userId
    const auditTrail = await Audit.find({ userId }).sort({ timestamp: -1 });
    
    if (auditTrail.length === 0) {
      return res.status(404).json({ message: "No audit trail found for this user." });
    }

    // Respond with the fetched audit trail
    res.status(200).json({ auditTrail });

  } catch (error) {
    console.error("Failed to fetch audit trail:", error);
    res.status(500).json({ message: "Failed to fetch audit trail", error });
  }
});

// Export the router
module.exports = router;
