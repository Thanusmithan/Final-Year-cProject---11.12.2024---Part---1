//backend/ServicesContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const ServicesContext = createContext();

export const useServices = () => useContext(ServicesContext);

export const ServicesProvider = ({ children }) => {
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/services");
            if (!response.ok) throw new Error("Failed to fetch services");
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services:", error);
        }
    };

    const addService = async (service) => {
        try {
            const response = await fetch("http://localhost:5000/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(service),
            });
            if (!response.ok) throw new Error("Failed to add service");

            const { service: newService } = await response.json(); // Get the newly added service
            setServices((prevServices) => [...prevServices, newService]); // Add it to the existing list
        } catch (error) {
            console.error("Failed to add service:", error);
        }
    };

    const editService = async (id, updatedService) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedService),
            });
            if (!response.ok) throw new Error("Failed to update service");

            const { service: updated } = await response.json();
            setServices((prevServices) =>
                prevServices.map((service) => (service._id === id ? updated : service))
            );
        } catch (error) {
            console.error("Failed to edit service:", error);
        }
    };

    const deleteService = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete service");

            setServices((prevServices) => prevServices.filter((service) => service._id !== id));
        } catch (error) {
            console.error("Failed to delete service:", error);
        }
    };

    return (
        <ServicesContext.Provider value={{ services, addService, editService, deleteService }}>
            {children}
        </ServicesContext.Provider>
    );
};
