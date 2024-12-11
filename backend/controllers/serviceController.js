//serviceController.js
const Service = require("../models/Service");

// Create a new service
exports.createService = async (req, res) => {
    try {
        const { serviceName, serviceDescription, doctorName, availableTimes } = req.body;
        const newService = new Service({
            serviceName,
            serviceDescription,
            doctorName,
            availableTimes,
        });
        const savedService = await newService.save();
        res.status(201).json({ message: "Service created successfully", service: savedService });
    } catch (error) {
        res.status(500).json({ message: "Failed to create service", error: error.message });
    }
};

// Get all services
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve services", error: error.message });
    }
};

// Update a service
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ message: "Service updated successfully", service: updatedService });
    } catch (error) {
        res.status(500).json({ message: "Failed to update service", error: error.message });
    }
};

// Delete a service
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await Service.findByIdAndDelete(id);
        if (!deletedService) {
            return res.status(404).json({ message: "Service not found" });
        }
        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete service", error: error.message });
    }
};
