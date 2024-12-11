// Componets/AppointmentsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AppointmentsContext = createContext();

export const useAppointments = () => {
    return useContext(AppointmentsContext);
};

// Convert 24-hour time to 12-hour format
const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(":");
    let ampm = "AM";
    hours = parseInt(hours, 10);

    if (hours >= 12) {
        ampm = "PM";
        hours = hours > 12 ? hours - 12 : hours;
    } else {
        hours = hours === 0 ? 12 : hours;
    }

    return `${hours}:${minutes} ${ampm}`;
};

// Convert 12-hour time to 24-hour format
const convertTo24HourFormat = (time) => {
    let [timePart, ampm] = time.split(" ");
    let [hours, minutes] = timePart.split(":");

    if (ampm === "PM" && hours !== "12") {
        hours = parseInt(hours, 10) + 12;
    } else if (ampm === "AM" && hours === "12") {
        hours = "00";
    }

    return `${hours}:${minutes}`;
};

export const AppointmentsProvider = ({ children }) => {
    const [appointments, setAppointments] = useState([]);

    // Fetch all appointments from the backend
    const fetchAppointments = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/appointments");
            if (!response.ok) throw new Error("Error fetching appointments");
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments:", error.message);
        }
    };

    // Fetch appointments for a specific user
    const fetchUserAppointments = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/user/${userId}`);
            if (!response.ok) throw new Error("Error fetching user-specific appointments");
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch user appointments:", error.message);
        }
    };
    

    // Add a new appointment to the backend
    const addAppointment = async (appointment) => {
        try {
            const response = await fetch("http://localhost:5000/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointment),
            });
            if (response.ok) {
                await fetchAppointments();
            } else {
                const errorData = await response.json();
                console.error("Failed to add appointment:", errorData.message);
            }
        } catch (error) {
            console.error("Failed to add appointment:", error.message);
        }
    };

    // Update an existing appointment in the backend
    const updateAppointment = async (appointment) => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${appointment._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointment),
            });
            if (response.ok) {
                await fetchAppointments();
            } else {
                const errorData = await response.json();
                console.error("Failed to update appointment:", errorData.message);
            }
        } catch (error) {
            console.error("Failed to update appointment:", error.message);
        }
    };

    // Delete an appointment from the backend
    const deleteAppointment = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${id}`, { method: "DELETE" });
            if (response.ok) {
                await fetchAppointments();
            } else {
                const errorData = await response.json();
                console.error("Failed to delete appointment:", errorData.message);
            }
        } catch (error) {
            console.error("Failed to delete appointment:", error.message);
        }
    };

    return (
        <AppointmentsContext.Provider
            value={{
                appointments,
                fetchAppointments,
                fetchUserAppointments, // Added function to fetch user-specific appointments
                addAppointment,
                updateAppointment,
                deleteAppointment,
                convertTo12HourFormat,
                convertTo24HourFormat,
            }}
        >
            {children}
        </AppointmentsContext.Provider>
    );
};
