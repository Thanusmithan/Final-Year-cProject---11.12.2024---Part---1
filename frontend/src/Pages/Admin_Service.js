// Admin_Service.js
import React, { useState } from 'react';
import './Css/Admin_Services.css';
import Header from './Componets/Admin_Header';
import Footer from './Componets/Footer';
import { useServices } from './Componets/ServicesContext';
import { Button, Card, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlusCircle } from '@fortawesome/free-solid-svg-icons';

const Admin_Service = () => {
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [availableTimes, setAvailableTimes] = useState([{ day: '', startTime: '', endTime: '' }]);
  const [editingServiceId, setEditingServiceId] = useState(null);

  const { services, addService, editService, deleteService } = useServices();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddTimeSlot = () => {
    setAvailableTimes([...availableTimes, { day: '', startTime: '', endTime: '' }]);
  };

  const handleAvailableTimeChange = (index, field, value) => {
    const updatedTimes = [...availableTimes];
    updatedTimes[index][field] = value;
    setAvailableTimes(updatedTimes);
  };

  const handleAddOrEditService = () => {
    if (!serviceName || !serviceDescription || !doctorName) return;

    const formattedTimes = availableTimes
      .filter((time) => time.day && time.startTime && time.endTime) // Only save valid time slots
      .map((time) => ({
        day: time.day,
        slots: `${time.startTime} - ${time.endTime}`,
      }));

    if (editingServiceId) {
      editService(editingServiceId, {
        serviceName,
        serviceDescription,
        doctorName,
        availableTimes: formattedTimes,
      });
      setEditingServiceId(null);
    } else {
      addService({
        serviceName,
        serviceDescription,
        doctorName,
        availableTimes: formattedTimes,
      });
    }

    // Reset fields
    setServiceName('');
    setServiceDescription('');
    setDoctorName('');
    setAvailableTimes([{ day: '', startTime: '', endTime: '' }]);
  };

  const handleEditService = (service) => {
    setServiceName(service.serviceName);
    setServiceDescription(service.serviceDescription);
    setDoctorName(service.doctorName);
    setAvailableTimes(
      service.availableTimes?.map((time) => {
        if (typeof time.slots === 'string' && time.slots.includes(' - ')) {
          const [startTime, endTime] = time.slots.split(' - ');
          return { day: time.day, startTime, endTime };
        }
        return { day: time.day || '', startTime: '', endTime: '' };
      }) || [{ day: '', startTime: '', endTime: '' }]
    );
    setEditingServiceId(service._id);
  };

  const handleDeleteService = (id) => {
    deleteService(id);
  };

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <h2 className="admin-service-txt-center">Manage Hospital Services</h2>
        <div className="container">
          {/* Add Service Section */}
          <div className="add-service-section py-4 px-3 mb-5 bg-light border rounded">
            <Form className="p-2">
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="serviceName">
                    <Form.Label className="bold">Service Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter service name"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="serviceDescription">
                    <Form.Label className="bold">Service Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter service description"
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <Form.Group controlId="doctorName">
                    <Form.Label className="bold">Doctor's Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter doctor's name"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label className="bold">Available Times</Form.Label>
                    {availableTimes.map((time, index) => (
                      <Row key={index} className="mb-2">
                        <Col>
                          <Form.Control
                            as="select"
                            value={time.day}
                            onChange={(e) => handleAvailableTimeChange(index, 'day', e.target.value)}
                          >
                            <option value="">Select Day</option>
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control
                            type="time"
                            value={time.startTime}
                            onChange={(e) => handleAvailableTimeChange(index, 'startTime', e.target.value)}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="time"
                            value={time.endTime}
                            onChange={(e) => handleAvailableTimeChange(index, 'endTime', e.target.value)}
                          />
                        </Col>
                      </Row>
                    ))}
                    <Button onClick={handleAddTimeSlot} variant="secondary" className="mb-2">
                      + Add Slot
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" className="w-100" onClick={handleAddOrEditService}>
                {editingServiceId ? (
                  <>
                    <FontAwesomeIcon icon={faEdit} className="me-2" /> Update Service
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlusCircle} className="me-2" /> Add Service
                  </>
                )}
              </Button>
            </Form>
          </div>

          {/* Existing Services Section */}
          <h3 className="text-center mb-4">Existing Services</h3>
          <Row className="g-4">
            {services.map((service) => (
              <Col md={6} lg={4} key={service._id}>
                <Card className="admin-service-card shadow-sm">
                  <Card.Body>
                    <div className="service-details">
                      <h5 className="service-title">{service.serviceName}</h5>
                      <p className="service-description">
                        <strong>Description:</strong> {service.serviceDescription}
                      </p>
                      <p className="doctor-name">
                        <strong>Doctor:</strong> {service.doctorName}
                      </p>
                      <p>
                        <strong>Available Times:</strong>
                      </p>
                      {service.availableTimes?.length > 0 ? (
                        <ul>
                          {service.availableTimes.map((time, index) => (
                            <li key={index}>
                              <strong>{time.day}:</strong> {time.slots}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No available time slots</p>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-center">
                    <Dropdown drop="end">
                      <Dropdown.Toggle variant="outline-success" className="dropdown-btn">
                        Manage
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end" style={{ backgroundColor: '#5C636A' }}>
                        <Dropdown.Item onClick={() => handleEditService(service)}>
                          <FaEdit className="me-2" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleDeleteService(service._id)}
                          className="text-danger"
                        >
                          <FaTrash className="me-2" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin_Service;
