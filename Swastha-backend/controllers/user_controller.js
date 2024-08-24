const mongoose = require("mongoose");
const Users = require("../model/user_model");
const Audit = require("../model/audit_model");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../middleware/sendMail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const sanitize = require("mongo-sanitize");
const rateLimit = require("express-rate-limit");
const logUserActivity = require("../middleware/logUserActivity");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Rate limiter to prevent brute-force attacks on login
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 login requests per windowMs
  message: "Too many login attempts from this IP, please try again after 10 minutes",
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Secure password function
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    throw new Error("Error while securing the password.");
  }
};

// Validate password with complexity requirements
const validatePassword = (password) => {
  const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;
  const numberRegex = /[0-9]/;

  if (!specialCharacterRegex.test(password)) {
    throw new Error("Password must contain at least one special character.");
  }
  if (!uppercaseRegex.test(password)) {
    throw new Error("Password must contain at least one uppercase letter.");
  }
  if (!lowercaseRegex.test(password)) {
    throw new Error("Password must contain at least one lowercase letter.");
  }
  if (!numberRegex.test(password)) {
    throw new Error("Password must contain at least one number.");
  }
};

// Check if the new password has been used recently
const checkPasswordHistory = async (userId, newPassword) => {
  const user = await Users.findById(userId);
  const passwordMatch = await Promise.all(
    user.passwordHistory.map(async (oldPassword) => {
      return await bcrypt.compare(newPassword, oldPassword);
    })
  );
  return passwordMatch.some((match) => match === true);
};

// Update the password history
const updatePasswordHistory = async (user) => {
  user.passwordHistory = user.passwordHistory || [];
  user.passwordHistory.push(user.password);
  if (user.passwordHistory.length > 5) {
    user.passwordHistory.shift(); // Keep only the last 5 passwords
  }
  await user.save();
};

// Change password controller with audit trail logging

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.userId;

  // Validate the user ID
  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify the old password
    const isOldPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isOldPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Check if the new password is in the history
    if (await checkPasswordHistory(user._id, newPassword)) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse a previous password. Please choose a new password.",
      });
    }

    // Securely update the new password
    await user.securePassword(newPassword);
    await updatePasswordHistory(user);

    // Log the user activity
    logUserActivity(req, res, () => {});

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: Something went wrong during password change.",
    });
  }
};

// Create user controller with audit trail logging
const createUser = [
  // Validation and sanitization middleware
  body('username').trim().notEmpty().withMessage('Please enter your name').escape(),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('phoneNumber').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits').escape(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      validatePassword(value);
      return true;
    }).escape(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }).escape(),

  async (req, res) => {
    // Sanitize incoming request data
    req.body = sanitize(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, phoneNumber, password } = req.body;

    try {
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists.",
        });
      }

      const encryptedPassword = await securePassword(password);

      const newUser = new Users({
        username,
        email,
        phoneNumber,
        password: encryptedPassword,
        confirmPassword: encryptedPassword,
        passwordHistory: [encryptedPassword], // Initialize password history
      });

      await newUser.save();

      // Log user activity
      req.body.userId = newUser._id;
      req.body.action = "User Created";
      req.body.details = `New user ${username} was created`;

      res.status(200).json({
        success: true,
        message: "User created successfully.",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  },
  logUserActivity, // Apply the middleware to log the activity
];

const loginUser = [
  // Apply rate limiter to login route
  loginLimiter,

  // Validation and sanitization middleware
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Please enter your password').escape(),

  async (req, res, next) => {
    // Sanitize incoming request data
    req.body = sanitize(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User does not exist. Please check your email and try again.",
        });
      }

      if (user.isLocked) {
        const lockTimeLeft = Math.round((user.lockUntil - Date.now()) / 1000);
        return res.status(403).json({
          success: false,
          message: `Account is temporarily locked. Try again in ${lockTimeLeft} seconds.`,
        });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        // Increment login attempts if applicable
        await user.incrementLoginAttempts();

        // Check if the account is now locked after this attempt
        if (user.loginAttempts + 1 >= 3 && !user.isLocked) {
          await user.updateOne({
            $set: { lockUntil: Date.now() + 10 * 60 * 1000 }, // Lock for 10 minutes
            $inc: { loginAttempts: 1 },
          });
          return res.status(403).json({
            success: false,
            message: "Too many attempts, your account is temporarily locked.",
          });
        }

        return res.status(400).json({
          success: false,
          message: "Invalid credentials. Please check your email and password.",
        });
      }

      // Reset login attempts if successful login
      if (user.loginAttempts > 0 || user.isLocked) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      // Prepare log data
      req.body.userId = user._id;  // Ensure userId is set
      req.body.action = "User Login";
      req.body.details = `User ${user.email} logged in successfully`;

      // Log user activity and respond
      logUserActivity(req, res, () => {
        res.status(200).json({
          success: true,
          message: "Logged in successfully.",
          token,
          userData: {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            username: user.username,      // Add username to the response
            phoneNumber: user.phoneNumber, // Add phoneNumber to the response
          },
        });
      });

    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }
  }
];



// Forgot password controller
const forgotPassword = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    if (user.is_verified === false) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    const resetPasswordToken = user.getresetPasswordToken();
    await user.save();

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const resetUrl = `${frontendBaseUrl}/password/reset/${resetPasswordToken}`;

    const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: "Error sending email: " + error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// // Reset password controller
// const resetPassword = async (req, res) => {
//   try {
//     const resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(req.params.token)
//       .digest("hex");

//     const user = await Users.findOne({
//       resetPasswordToken,
//       resetPasswordExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Token is invalid or has expired.",
//       });
//     }

//     if (await checkPasswordHistory(user._id, req.body.password)) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot reuse a previous password. Please choose a new password.",
//       });
//     }

//     const newPassword = await securePassword(req.body.password);
//     user.password = newPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await updatePasswordHistory(user); // Update password history after successful reset
//     await user.save();

//     // Log the password reset activity
//     await logUserActivity({
//       userId: user.id,
//       action: "Password Reset",
//       ip: req.ip,
//       details: `User reset their password.`,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Password updated successfully.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Get all users controller
const getUsers = async (req, res) => {
  try {
    const allUsers = await Users.find({});
    res.json({
      success: true,
      message: "Users fetched successfully",
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get single user controller
const getSingleUser = async (req, res) => {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  try {
    const singleUser = await Users.findById(userId);
    if (!singleUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.json({
      success: true,
      message: "User fetched successfully.",
      user: singleUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete user controller
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  try {
    const user = await Users.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get paginated users controller
const getPagination = async (req, res) => {
  const page = parseInt(req.query.page);
  const pageSize = 5;

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  try {
    const users = await Users.find();

    const paginatedUsers = users.slice(startIndex, endIndex);
    const totalPages = Math.ceil(users.length / pageSize);

    res.json({ users: paginatedUsers, totalPages });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateUserProfile = async (req, res) => {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let avatarUrl = user.avatar;
    if (req.files && req.files.avatar) {
      const { avatar } = req.files;
      const uploadedAvatar = await cloudinary.uploader.upload(avatar.path, { folder: 'avatars' });
      if (!uploadedAvatar || !uploadedAvatar.secure_url) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload avatar to Cloudinary',
        });
      }
      avatarUrl = uploadedAvatar.secure_url;
    } else if (typeof req.body.avatar === 'string') {
      avatarUrl = req.body.avatar;
    }

    user.username = req.body.username || user.username;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.avatar = avatarUrl || user.avatar;

    await user.save();

    // Log user activity to audit trail
    const audit = new Audit({
      userId: user.id,
      action: "Profile Update",
      details: `User ${user.username} updated their profile`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });
    await audit.save();

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully.',
      user: {
        username: user.username,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).json({ success: false, message: "Failed to log out" });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

module.exports = {
  createUser,
  loginUser,
  forgotPassword,
  //resetPassword,
  getUsers,
  getSingleUser,
  deleteUser,
  getPagination,
  updateUserProfile,
  changePassword,
  logoutUser,
};
