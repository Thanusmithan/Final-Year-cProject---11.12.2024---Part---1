// // models/Appointment.js
const mongoose = require("mongoose"); // Add this line to import mongoose

const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    doctor: { type: String, required: true },
    service: { type: String, required: true },
});

// Add an index to enforce unique appointments for the same doctor at the same time
appointmentSchema.index({ date: 1, time: 1, doctor: 1 }, { unique: true });

module.exports = mongoose.model("Appointment", appointmentSchema);

