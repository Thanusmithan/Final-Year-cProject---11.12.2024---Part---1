//UserDashboard header.js code
import React, { useEffect, useState } from 'react';
import '../Css/Parient_dashboard_Header.css';
import logo from '../Images/logo.svg';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHome, faCalendarAlt, faConciergeBell, faEnvelope, faStar, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user')) || { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' };
        setUser(storedUser);
    }, []);

    return (
        <header className="homepage-header">
            <Container>
                <Row className="d-flex align-items-center justify-content-between">
                    <Col lg={9} md={9}>
                        <div className="logo">
                            <img src={logo} alt="Ayurvedic Medical Hospital" />
                        </div>
                    </Col>
                    <Col className="text-end" lg={3} md={3}>
                        <div className="user-info">
                            <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                            <span className="user-name">Hello!, {user.lastName}</span>
                            <Dropdown>
                                <Dropdown.Toggle variant="secondary" className="patient-profile-dropdown-toggle" />
                                <Dropdown.Menu className="dropdown-menu-custom">
                                    <Dropdown.Item href="/profile">
                                        <FontAwesomeIcon icon={faUserCircle} className="dropdown-icon me-2" /> View Profile
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href="/patient_dashboard">
                                        <FontAwesomeIcon icon={faHome} className="dropdown-icon me-2" /> Home
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/patient_appointment">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="dropdown-icon me-2" /> Appointment
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/patient_services">
                                        <FontAwesomeIcon icon={faConciergeBell} className="dropdown-icon me-2" /> Service
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/patient_messages">
                                        <FontAwesomeIcon icon={faEnvelope} className="dropdown-icon me-2" /> Messages
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/patient_review">
                                        <FontAwesomeIcon icon={faStar} className="dropdown-icon me-2" /> Ratings
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item as={Link} to="/Login" className="text-white">
                                        <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon me-2" /> Log Out
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>
            </Container>
        </header>
    );
};

export default Header;
