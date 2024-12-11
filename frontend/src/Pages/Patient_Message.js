// patient_messages.js
import React, { useState, useEffect } from 'react';
import './Css/Patient_Message.css';
import Header from './Componets/Patientdashboard_Header';
import Footer from './Componets/Footer';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import { FaPaperPlane, FaInbox, FaEdit, FaTrash, FaBullhorn } from "react-icons/fa";

const PatientMessagingPage = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredSentMessages, setFilteredSentMessages] = useState([]);
  const [filteredReceivedMessages, setFilteredReceivedMessages] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchSentMessages();
    fetchReceivedMessages();
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    applyDateFilter();
  }, [filterDate, sentMessages, receivedMessages, announcements]);

  const fetchSentMessages = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?._id;
      const response = await fetch(`/api/messages/${userId}/sent`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const sortedData = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setSentMessages(sortedData);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
    }
  };

  const fetchReceivedMessages = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?._id;
      const response = await fetch(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const sortedData = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setReceivedMessages(sortedData);
    } catch (error) {
      console.error('Error fetching received messages:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const sortedData = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      setAnnouncements(sortedData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const applyDateFilter = () => {
    if (!filterDate) {
      setFilteredSentMessages(sentMessages);
      setFilteredReceivedMessages(receivedMessages);
      setFilteredAnnouncements(announcements);
      return;
    }

    const filterByDate = (items) =>
      items.filter((item) => {
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        return itemDate === filterDate;
      });

    setFilteredSentMessages(filterByDate(sentMessages));
    setFilteredReceivedMessages(filterByDate(receivedMessages));
    setFilteredAnnouncements(filterByDate(announcements));
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = date.toLocaleTimeString('en-US', options);
    const dateString = date.toLocaleDateString();
    return `${dateString}, ${timeString}`;
  };

  const handleSendMessage = async () => {
    if (!messageContent) {
      setAlert({ show: true, message: 'Please enter a message.', type: 'danger' });
      return;
    }

    try {
      const method = editingMessage ? 'PUT' : 'POST';
      const url = editingMessage
        ? `/api/messages/${editingMessage._id}`
        : '/api/messages';

      const body = editingMessage
        ? { content: messageContent }
        : {
            receiverId: "admin",
            senderId: JSON.parse(localStorage.getItem('user'))?._id,
            content: messageContent,
          };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setAlert({
          show: true,
          message: editingMessage ? 'Message updated successfully!' : 'Message sent successfully!',
          type: 'success',
        });
        fetchSentMessages();
      } else {
        setAlert({ show: true, message: 'Error saving message.', type: 'danger' });
      }
    } catch (error) {
      console.error('Error saving message:', error);
      setAlert({ show: true, message: 'Error saving message.', type: 'danger' });
    }

    setMessageContent('');
    setEditingMessage(null);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageContent(message.content || '');
  };

  const handleDeleteMessage = async (id, isSent) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        if (isSent) {
          setSentMessages(sentMessages.filter((msg) => msg._id !== id));
        } else {
          setReceivedMessages(receivedMessages.filter((msg) => msg._id !== id));
        }
        setAlert({ show: true, message: 'Message deleted successfully!', type: 'success' });
      } else {
        setAlert({ show: true, message: 'Error deleting message.', type: 'danger' });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setAlert({ show: true, message: 'Error deleting message.', type: 'danger' });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  return (
    <>
      <Header />
      <h2 className="patient-message-txt-center">Send a Message</h2>
      <div className="patient-message-container my-5">
        {alert.show && (
          <Alert
            variant={alert.type}
            onClose={handleCloseAlert}
            dismissible
            className="patient-message-alert d-flex justify-content-between align-items-center p-3"
            style={{ maxWidth: '500px' }}
          >
            <strong className="flex-grow-1">{alert.message}</strong>
          </Alert>
        )}

         <div className="filter-section mb-4">
          <label htmlFor="filterDate" className="form-label">
          <Badge bg="primary">Filter</Badge>
          </label>
          <input
            type="date"
            id="filterDate"
            placeholder='Filter by Date:'
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{width:'45px'}}
          />
        </div> 



        <div className="messaging-section p-4 rounded shadow">
          <h4><FaPaperPlane className="me-2" />{editingMessage ? "Edit Message" : "Message the Admin"}</h4>
          <textarea
            className="form-control mt-3"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Enter message here..."
          ></textarea>
          <button className="btn btn-success mt-3" onClick={handleSendMessage}>
            <FaPaperPlane className="me-2" /> {editingMessage ? "Update Message" : "Send Message"}
          </button>
        </div>

        <div className="messages-display mt-5 p-4 rounded shadow">
          <h4><FaInbox className="me-2" />Sent Messages</h4>
          {filteredSentMessages.length > 0 ? (
            <ul className="list-group">
              {filteredSentMessages.map((msg) => (
                <li key={msg._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    To: Admin - {msg.content} <br />
                    <small className="text-muted">{formatDateTime(msg.createdAt)}</small>
                  </span>
                  <div>
                    <FaEdit className="text-primary me-2" onClick={() => handleEditMessage(msg)} />
                    <FaTrash className="text-danger" onClick={() => handleDeleteMessage(msg._id, true)} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sent messages to display.</p>
          )}
        </div>

        <div className="messages-display mt-5 p-4 rounded shadow">
          <h4><FaInbox className="me-2" />Received Messages from Admin</h4>
          {filteredReceivedMessages.length > 0 ? (
            <ul className="list-group">
              {filteredReceivedMessages.map((msg) => (
                <li key={msg._id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    Admin: {msg.content} <br />
                    <small className="text-muted">{formatDateTime(msg.createdAt)}</small>
                  </span>
                  <FaTrash className="text-danger" onClick={() => handleDeleteMessage(msg._id, false)} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No received messages to display.</p>
          )}
        </div>

        <div className="announcements-section mt-5 p-4 rounded shadow">
          <h4><FaBullhorn className="me-2" />Admin Announcements</h4>
          {filteredAnnouncements.length > 0 ? (
            <ul className="list-group">
              {filteredAnnouncements.map((announcement) => (
                <li key={announcement._id} className="list-group-item">
                  {announcement.content} <br />
                  <small className="text-muted">{formatDateTime(announcement.createdAt)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No announcements to display.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PatientMessagingPage;
