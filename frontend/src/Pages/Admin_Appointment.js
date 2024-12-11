//Admin_Appointment.js 
import React, { useState, useEffect } from "react";
import "./Css/Appointment_Admin.css";
import Header from "./Componets/Admin_Header";
import Footer from "./Componets/Footer";
import { Container, Dropdown } from "react-bootstrap";
import {
  FaTrashAlt,
  FaEllipsisV,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaConciergeBell,
  FaEdit,
} from "react-icons/fa";
import { useAppointments } from "./Componets/AppointmentsContext";

const AdminAppointment = () => {
  const {
    appointments,
    deleteAppointment,
    updateAppointment,
    convertTo12HourFormat,
    convertTo24HourFormat,
    fetchAppointments,
  } = useAppointments();

  const [editAppointmentId, setEditAppointmentId] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    date: "",
    time: "",
    doctor: "",
    service: "",
  });

  // Fetch appointments on load
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        await fetchAppointments();
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
      }
    };

    loadAppointments();
  }, [fetchAppointments]);

  // Edit handler
  const handleEditAppointment = (appointment) => {
    setEditAppointmentId(appointment._id);
    setFormData({
      ...appointment,
      time: convertTo12HourFormat(appointment.time),
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Save updated appointment
  const handleSaveEdit = async () => {
    const updatedAppointment = {
      ...formData,
      _id: editAppointmentId,
      time: convertTo24HourFormat(formData.time),
    };

    try {
      await updateAppointment(updatedAppointment);
      await fetchAppointments(); // Refresh list after update
      setEditAppointmentId(null);
    } catch (error) {
      console.error("Error updating appointment:", error.message);
    }
  };

  // Delete appointment handler
  const handleDeleteAppointment = async (id) => {
    try {
      await deleteAppointment(id);
      await fetchAppointments(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting appointment:", error.message);
    }
  };

  // Sort appointments
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateComparison = new Date(a.date) - new Date(b.date);
    if (dateComparison !== 0) return dateComparison;

    const timeComparison = convertTo24HourFormat(a.time).localeCompare(
      convertTo24HourFormat(b.time)
    );
    if (timeComparison !== 0) return timeComparison;

    return a.patientName.localeCompare(b.patientName);
  });

  return (
    <>
      <Header />
      <div className="admin-appointment-wrapper">
        <Container fluid className="my-5">
          <div className="table-responsive">
            <h2 className="admin-appointment-txt-center">
              Manage Patient's Appointments
            </h2>
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th style={{ textAlign: "left" }}>
                    <FaUser style={{ marginRight: "5px" }} /> Patient Name
                  </th>
                  <th>
                    <FaUser style={{ marginRight: "5px" }} /> Age
                  </th>
                  <th>
                    <FaUser style={{ marginRight: "5px" }} /> Gender
                  </th>
                  <th>
                    <FaCalendarAlt style={{ marginRight: "5px" }} /> Date
                  </th>
                  <th>
                    <FaClock style={{ marginRight: "5px" }} /> Time
                  </th>
                  <th>
                    <FaStethoscope style={{ marginRight: "5px" }} /> Doctor
                  </th>
                  <th>
                    <FaConciergeBell style={{ marginRight: "5px" }} /> Service
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAppointments.length > 0 ? (
                  sortedAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td style={{ textAlign: "left" }}>{appointment.patientName}</td>
                      <td>{appointment.age}</td>
                      <td>{appointment.gender}</td>
                      <td>{appointment.date}</td>
                      <td>{convertTo12HourFormat(appointment.time)}</td>
                      <td>{appointment.doctor}</td>
                      <td>{appointment.service}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="secondary"
                            id={`dropdownMenuButton-${appointment._id}`}
                          >
                            <FaEllipsisV />
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ backgroundColor: "#565E64" }}>
                            <Dropdown.Item
                              as="button"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <FaEdit className="me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              as="button"
                              onClick={() =>
                                handleDeleteAppointment(appointment._id)
                              }
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
                    <td colSpan="8" className="text-center">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {editAppointmentId && (
            <div className="modal show" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit Appointment</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setEditAppointmentId(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form>
                      {[ 
                        { label: "Patient Name", name: "patientName", type: "text" },
                        { label: "Age", name: "age", type: "number" },
                        { label: "Gender", name: "gender", type: "select" },
                        { label: "Date", name: "date", type: "date" },
                        { label: "Time", name: "time", type: "time" },
                        { label: "Doctor", name: "doctor", type: "text" },
                        { label: "Service", name: "service", type: "text" },
                      ].map((field, index) => (
                        <div className="mb-3" key={index}>
                          <label>{field.label}</label>
                          {field.type === "select" ? (
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleChange}
                              className="form-control"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleChange}
                              className="form-control"
                            />
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveEdit}
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default AdminAppointment;
