//ViewAppointment.js
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import Header from "./Componets/Patientdashboard_Header";
import Footer from "./Componets/Footer";
import { Dropdown } from "react-bootstrap";
import {
  FaTrashAlt,
  FaEllipsisV,
  FaEdit,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Css/ViewAppointment.css";

const ViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [services, setServices] = useState([]); // Holds all services

  // Fetch logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  // Helper function: Convert time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const formattedHour = hour % 12 || 12; // Convert to 12-hour format
    const amPm = hour < 12 || hour === "00" ? "AM" : "PM";
    return `${formattedHour}:${minute} ${amPm}`;
  };

  // Fetch appointments for the logged-in user
  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments/user/${userEmail}`);
        if (!response.ok) throw new Error("Failed to load appointments.");
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        setAlert({ show: true, message: error.message, variant: "danger" });
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/services`);
        if (!response.ok) throw new Error("Failed to load services.");
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error.message);
      }
    };

    if (userEmail) {
      fetchUserAppointments();
      fetchServices();
    }
  }, [userEmail]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    // Auto-update doctorName when a service is selected
    if (name === "service") {
      const selectedService = services.find((service) => service.serviceName === value);
      if (selectedService) {
        updatedData = { ...updatedData, doctor: selectedService.doctorName };
      }
    }

    setFormData(updatedData);
  };

  // Handle Save Changes
  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/appointments/${formData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update appointment.");

      setAppointments((prev) =>
        prev.map((app) => (app._id === formData._id ? formData : app))
      );
      setShowModal(false);
      setAlert({ show: true, message: "Appointment updated successfully.", variant: "success" });
    } catch (error) {
      setAlert({ show: true, message: error.message, variant: "danger" });
    }
  };

  // Handle Delete Appointment
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete appointment.");

      setAppointments((prev) => prev.filter((app) => app._id !== id));
      setAlert({ show: true, message: "Appointment canceled successfully.", variant: "warning" });
    } catch (error) {
      setAlert({ show: true, message: error.message, variant: "danger" });
    }
  };

  return (
    <>
      <Header />
      <>
        <h2 className="viewAppointment-text-center mb-4">My Appointments</h2>
        <div className="viewAppointment-container my-4">
          {alert.show && (
            <Alert
              variant={alert.variant}
              onClose={() => setAlert({ show: false, message: "", variant: "" })}
              dismissible
            >
              {alert.message}
            </Alert>
          )}

          <Table striped bordered hover className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Service</th>
                <th>Actions</th>
              </tr>
            </thead>
            {/* <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment, index) => (
                <tr key={appointment._id}>
                  <td>{index + 1}</td>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.age}</td>
                  <td>{appointment.gender}</td>
                  <td>{appointment.date}</td>
                  <td>{formatTimeTo12Hour(appointment.time)}</td> 
                  <td>{appointment.doctor}</td>
                  <td>{appointment.service}</td>
                  <td>
                    <Dropdown drop="end">
                      <Dropdown.Toggle
                        variant="secondary"
                        id={`dropdownMenuButton-${appointment._id}`}
                      >
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{ backgroundColor: "#565E64" }}>
                        <Dropdown.Item
                          as="button"
                          onClick={() => {
                            setFormData(appointment);
                            setShowModal(true);
                          }}
                        >
                          <FaEdit className="me-2" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          as="button"
                          onClick={() => handleDelete(appointment._id)}
                        >
                          <FaTrashAlt className="me-2" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody> */}
            <tbody>
              {appointments.length > 0 ? (
                appointments
                  .sort((a, b) => {
                    // Combine date and time for sorting
                    const dateTimeA = new Date(`${a.date}T${a.time}`);
                    const dateTimeB = new Date(`${b.date}T${b.time}`);
                    return dateTimeA - dateTimeB;
                  })
                  .map((appointment, index) => (
                    <tr key={appointment._id}>
                      <td>{index + 1}</td>
                      <td>{appointment.patientName}</td>
                      <td>{appointment.age}</td>
                      <td>{appointment.gender}</td>
                      <td>{appointment.date}</td>
                      <td>{formatTimeTo12Hour(appointment.time)}</td> {/* 12-Hour Format */}
                      <td>{appointment.doctor}</td>
                      <td>{appointment.service}</td>
                      <td>
                        <Dropdown drop="end">
                          <Dropdown.Toggle
                            variant="secondary"
                            id={`dropdownMenuButton-${appointment._id}`}
                          >
                            <FaEllipsisV />
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ backgroundColor: "#565E64" }}>
                            <Dropdown.Item
                              as="button"
                              onClick={() => {
                                setFormData(appointment);
                                setShowModal(true);
                              }}
                            >
                              <FaEdit className="me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              as="button"
                              onClick={() => handleDelete(appointment._id)}
                            >
                              <FaTrashAlt className="me-2" /> Cancel
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <br />
        <br />
        <br />

        {/* Edit Appointment Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Patient Name</Form.Label>
                <Form.Control
                  name="patientName"
                  value={formData.patientName || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  name="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Service</Form.Label>
                <Form.Select name="service" value={formData.service || ""} onChange={handleChange}>
                  <option value="">Select a service</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.serviceName}>
                      {service.serviceName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Doctor</Form.Label>
                <Form.Control
                  name="doctor"
                  value={formData.doctor || ""}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  name="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  name="time"
                  type="time"
                  value={formData.time || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
      <Footer />
    </>
  );
};

export default ViewAppointment;
