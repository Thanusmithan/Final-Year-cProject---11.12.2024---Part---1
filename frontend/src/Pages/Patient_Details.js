// PatientDetails.js
import React, { useState, useEffect } from 'react';
import './Css/PatientDetails.css';
import Header from './Componets/Admin_Header';
import Footer from './Componets/Footer';
import { Dropdown } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaEllipsisV, FaTrashAlt } from 'react-icons/fa';
import Alert from './Alert';

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  // Function to dismiss alert after 2 seconds
  const setTemporaryAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 2000); // Dismiss alert after 2 seconds
  };

  // Fetch users from the backend
  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users'); // API to fetch users from 'users' collection
      const data = await response.json();

      // Filter out the admin user by email and sort by first name in ascending order
      const filteredAndSortedPatients = data
        .filter(user => user.email !== 'admin@hospital.com') // Replace with your admin email
        .sort((a, b) => a.firstName.localeCompare(b.firstName)); // Sort by first name

      setPatients(filteredAndSortedPatients);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  // Toggle editing mode for a specific patient
  const handleEditToggle = (id) => {
    setEditingPatientId(id);
  };

  // Handle input change for a specific patient
  const handleChange = (e, id) => {
    const { name, value } = e.target;
    setPatients((prevPatients) =>
      prevPatients.map((patient) =>
        patient._id === id ? { ...patient, [name]: value } : patient
      )
    );
  };

  // Save edited patient data to the backend
  const handleSave = async (id) => {
    const updatedPatient = patients.find((patient) => patient._id === id);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient),
      });
      if (response.ok) {
        setTemporaryAlert('Patient details updated successfully!', 'success');
        setEditingPatientId(null);
        fetchPatients(); // Refresh patient list
      } else {
        throw new Error('Failed to update patient');
      }
    } catch (error) {
      setTemporaryAlert('Error updating patient details.', 'danger');
      console.error('Error updating patient:', error);
    }
  };

  // Delete a patient record from the backend
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTemporaryAlert('Patient deleted successfully!', 'success');
        setPatients(patients.filter((patient) => patient._id !== id));
      } else {
        throw new Error('Failed to delete patient');
      }
    } catch (error) {
      setTemporaryAlert('Error deleting patient.', 'danger');
      console.error('Error deleting patient:', error);
    }
  };

  return (
    <>
      <Header />
      <div className="patient-details-wrapper">
        <h2 className="patientdeatils-txt-center">Patient Details</h2>
        <div className="patient-details-container">
          {alert && <Alert message={alert.message} type={alert.type} />}
          <table className="patient-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="action-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    {editingPatientId === patient._id ? (
                      <input
                        type="text"
                        name="firstName"
                        value={patient.firstName}
                        onChange={(e) => handleChange(e, patient._id)}
                        className="editable-field"
                      />
                    ) : (
                      patient.firstName
                    )}
                  </td>
                  <td>
                    {editingPatientId === patient._id ? (
                      <input
                        type="text"
                        name="lastName"
                        value={patient.lastName}
                        onChange={(e) => handleChange(e, patient._id)}
                        className="editable-field"
                      />
                    ) : (
                      patient.lastName
                    )}
                  </td>
                  <td>
                    {editingPatientId === patient._id ? (
                      <input
                        type="email"
                        name="email"
                        value={patient.email}
                        onChange={(e) => handleChange(e, patient._id)}
                        className="editable-field"
                      />
                    ) : (
                      patient.email
                    )}
                  </td>
                  <td>
                    {editingPatientId === patient._id ? (
                      <input
                        type="tel"
                        name="phone"
                        value={patient.phone}
                        onChange={(e) => handleChange(e, patient._id)}
                        className="editable-field"
                      />
                    ) : (
                      patient.phone
                    )}
                  </td>
                  <td className="action-center">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="secondary"
                        id={`dropdownMenuButton-${patient._id}`}
                      >
                        <FaEllipsisV />
                      </Dropdown.Toggle>
                      <Dropdown.Menu style={{ backgroundColor: '#565E64' }}>
                        {editingPatientId === patient._id ? (
                          <>
                            <Dropdown.Item as="button" onClick={() => handleSave(patient._id)}>
                              <FaSave className="me-2" /> Save
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={() => setEditingPatientId(null)}>
                              <FaTimes className="me-2" /> Cancel
                            </Dropdown.Item>
                          </>
                        ) : (
                          <>
                            <Dropdown.Item as="button" onClick={() => handleEditToggle(patient._id)}>
                              <FaEdit className="me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={() => handleDelete(patient._id)}>
                              <FaTrashAlt className="me-2" /> Delete
                            </Dropdown.Item>
                          </>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
      </div>
      <Footer />
    </>
  );
};

export default PatientDetails;
