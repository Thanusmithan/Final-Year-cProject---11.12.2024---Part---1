//models/Announcement.js
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admin ID is required"],
    },
    title: { type: String, required: [true, "Title is required"] },
    content: { type: String, required: [true, "Content is required"] },
    isDeleted: { type: Boolean, default: false }, // Soft delete functionality
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model("Announcement", announcementSchema);
