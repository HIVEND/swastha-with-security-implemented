const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter your phone number"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
    },
    passwordHistory: [
      {
        type: String,
      },
    ], // Array to store password history
    is_verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now, // Track the last time the password was changed
    },
    passwordExpiryDays: {
      type: Number,
      default: 1, // Set the password expiry period to 90 days
    },
  },
  { timestamps: true }
);

// Virtual field to check if the account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});  

// Method to securely compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
};

// Method to generate reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Method to securely hash a new password
userSchema.methods.securePassword = async function (password) {
  const passwordHash = await bcrypt.hash(password, 10);

  // Update password history
  this.passwordHistory.push(passwordHash);
  if (this.passwordHistory.length > 5) {
    this.passwordHistory.shift(); // Keep only the last 5 passwords
  }

  this.password = passwordHash;
  this.lastPasswordChange = Date.now(); // Update the last password change date
};

// Method to check if a password was used recently
userSchema.methods.isPasswordInHistory = async function (newPassword) {
  for (let i = 0; i < this.passwordHistory.length; i++) {
    const match = await bcrypt.compare(newPassword, this.passwordHistory[i]);
    if (match) {
      return true;
    }
  }
  return false;
};

// Method to check if the password is expired
userSchema.methods.isPasswordExpired = function () {
  const expiryDate = new Date(
    this.lastPasswordChange.getTime() +
    this.passwordExpiryDays * 90 * 60 * 60 * 1000 //passwordExpires in 90 days
  );
  return new Date() > expiryDate;
};

// Method to increment login attempts and set lockout time
userSchema.methods.incrementLoginAttempts = async function () {
  // If previous lock has expired, reset attempts and lockUntil
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise, increment login attempts and set lock if necessary
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 10 * 60 * 1000, // Lock for 10 minutes
    };
  }
  return await this.updateOne(updates);
};

const Users = mongoose.model("Users", userSchema);
module.exports = Users;
