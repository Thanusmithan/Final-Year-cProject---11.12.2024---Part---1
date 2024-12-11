// controllers/appointmentController.js
const Appointment = require("../models/Appointment");

// Create an appointment
exports.createAppointment = async (req, res) => {
    try {
        const { patientName, patientEmail, age, gender, date, time, doctor, service } = req.body;

        // Basic validation
        if (!patientName || !patientEmail || !age || !gender || !date || !time || !doctor || !service) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if an appointment already exists for the given date, time, and doctor
        const existingAppointment = await Appointment.findOne({ date, time, doctor });
        if (existingAppointment) {
            return res.status(400).json({ message: "This doctor is already booked at the selected time." });
        }

        // Create and save the new appointment
        const newAppointment = new Appointment({
            patientName,
            patientEmail,
            age,
            gender,
            date,
            time,
            doctor,
            service,
        });

        await newAppointment.save();

        res.status(201).json({
            message: "Appointment created successfully.",
            appointment: newAppointment,
        });
    } catch (error) {
        console.error("Error creating appointment:", error);

        // Handle duplicate error specifically
        if (error.code === 11000) {
            return res.status(400).json({ message: "This doctor is already booked at the selected time." });
        }

        res.status(500).json({ message: "Failed to create appointment.", error: error.message });
    }
};

// Get all appointments
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Failed to retrieve appointments.", error: error.message });
    }
};

// Get appointments for a specific user by email
exports.getAppointmentsByUser = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const appointments = await Appointment.find({ patientEmail: email });

        if (appointments.length === 0) {
            return res.status(404).json({ message: "No appointments found for this user." });
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching user appointments:", error);
        res.status(500).json({ message: "Failed to retrieve user appointments.", error: error.message });
    }
};

// Get a single appointment by ID (New Implementation)
exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        res.status(200).json(appointment);
    } catch (error) {
        console.error("Error fetching appointment by ID:", error);
        res.status(500).json({ message: "Failed to retrieve appointment.", error: error.message });
    }
};

// Update an appointment by ID
exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if the appointment exists
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        // Update the appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            message: "Appointment updated successfully.",
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Failed to update appointment.", error: error.message });
    }
};

// Delete an appointment by ID
exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the appointment exists before deletion
        const existingAppointment = await Appointment.findById(id);
        if (!existingAppointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }

        // Delete the appointment
        await Appointment.findByIdAndDelete(id);

        res.status(200).json({
            message: "Appointment deleted successfully.",
            id,
        });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ message: "Failed to delete appointment.", error: error.message });
    }
};