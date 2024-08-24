const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
  },
  details: {
    type: Object,
  },
});

const Audit = mongoose.model("Audit", auditSchema);
module.exports = Audit;
