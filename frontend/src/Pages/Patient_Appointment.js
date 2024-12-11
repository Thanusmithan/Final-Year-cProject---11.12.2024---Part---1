// Pages/Patient_Appointment.js
import React, { useState, useEffect } from 'react';
import './Css/PatientAppointment.css';
import './Css/SignUp.css';
import Header from './Componets/Patientdashboard_Header';
import Footer from './Componets/Footer';
import { Button, Table } from "react-bootstrap";
import CommonAppointmentForm from './Componets/AppointmentTable';
import { useAppointments } from './Componets/AppointmentsContext';

const PatientAppointment = () => {
  const { addAppointment } = useAppointments();
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    date: '',
    time: '',
    doctor: '',
    service: ''
  });

  const [services, setServices] = useState([]);
  const [showTable, setShowTable] = useState(false); // State to manage table visibility

  useEffect(() => {
    // Fetch services data
    fetch('/api/services')
      .then((response) => response.json())
      .then((data) => setServices(data))
      .catch((error) => console.error('Error fetching services:', error));
  }, []);

  const handleBookAppointment = () => {
    const newAppointment = {
      ...formData,
      id: Date.now() // unique ID based on timestamp
    };
    addAppointment(newAppointment);
    console.log('New appointment added:', newAppointment);

    // Clear the form data
    setFormData({
      patientName: '',
      age: '',
      gender: '',
      date: '',
      time: '',
      doctor: '',
      service: ''
    });
  };

  // Helper function to convert time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const date = new Date(0, 0, 0, hours, minutes);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="patient-appointment-wrapper">
      <Header />

      {/* Toggle Button for Service Table */}
      <div className="hide-btn">
        <Button
          variant="primary"
          onClick={() => setShowTable(!showTable)} // Toggle visibility
          style={{ marginLeft: '125px', marginTop: "20px" }}>
          {showTable ? 'Hide Services' : 'Show Available Services'}
        </Button>
      </div>

      {/* Service Details Table */}
      {showTable && (
        <div className="service-table-container mt-4 mb-4">
          <h4 className="text-center mb-3">Available Services and Times</h4>
          <Table striped bordered hover responsive style={{width:'91%', margin:'auto'}}>
            <thead>
              <tr>
                <th>Service Name</th>
                <th style={{textAlign:'left'}}>Doctor</th>
                <th>Day</th>
                <th>Time Slots</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) =>
                service.availableTimes.map((time, index) => (
                  <tr key={`${service._id}-${index}`}>
                    <td>{service.serviceName}</td>
                    <td style={{textAlign:'left'}}>{service.doctorName}</td>
                    <td>{time.day}</td>
                    <td>
                      {/* Ensure slots can handle both arrays and strings */}
                      {Array.isArray(time.slots)
                        ? time.slots.map((slot, slotIndex) => {
                            const [startTime, endTime] = slot.split(' - ');
                            return (
                              <span key={slotIndex}>
                                {formatTimeTo12Hour(startTime)} - {formatTimeTo12Hour(endTime)}
                                {slotIndex !== time.slots.length - 1 && ', '}
                              </span>
                            );
                          })
                        : (() => {
                            const [startTime, endTime] = time.slots.split(' - ');
                            return `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)}`;
                          })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      <div className="patient-appointment-container">
        <div className="appointment-left">
          <div className="app-left">
            <h2 className="patient-app-page-title">Book an Appointment</h2>
            <Button href="/ViewAppointment" className="patient-dashboard-btn mb-4">View Appointments</Button>
            <hr />

            <CommonAppointmentForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleBookAppointment}
              isAdmin={false}
            />
          </div>
        </div>
        <div className="signup-right">
          <div className="signup-right-content text-bg-light opacity-30">
            <h2>Ayurveda and Wellness</h2>
            <p>Ayurveda offers holistic healing...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PatientAppointment;
