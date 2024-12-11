//Admin_Message.js
import React, { useState, useEffect } from 'react';
import './Css/Message.css';
import Header from './Componets/Admin_Header';
import Footer from './Componets/Footer';
import Badge from 'react-bootstrap/Badge';
import { FaBullhorn, FaPaperPlane, FaInbox, FaEdit, FaTrash } from "react-icons/fa";
import Alert from 'react-bootstrap/Alert';

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], options)}`;
};

const AdminMessagingPage = () => {
  const [announcement, setAnnouncement] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [refresh, setRefresh] = useState('');
  const [filterDate, setFilterDate] = useState(''); // State for date filter

  useEffect(() => {
    fetchMessages();
    fetchReceivedMessages();
    fetchUsers();
    fetchAnnouncements();
  }, [refresh]);

  const fetchMessages = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))?._id;
      const response = await fetch(`/api/messages/${userId}/sent`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setSentMessages(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
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
      setReceivedMessages(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch (error) {
      console.error('Error fetching received messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const filteredUsers = data.filter((user) => user.role !== 'admin');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setSentAnnouncements(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const filterByDate = (items) => {
    if (!filterDate) return items; // If no filter date, return all items
    return items.filter((item) => {
      const itemDate = new Date(item.createdAt).toLocaleDateString();
      const selectedDate = new Date(filterDate).toLocaleDateString();
      return itemDate === selectedDate;
    });
  };

  const handlePostAnnouncement = async () => {
    if (!announcement) {
      setAlert({ show: true, message: 'Please enter an announcement.', type: 'danger' });
      return;
    }

    try {
      const method = editingAnnouncement ? 'PUT' : 'POST';
      const url = editingAnnouncement
        ? `/api/announcements/${editingAnnouncement._id}`
        : '/api/announcements';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: 'General Announcement',
          content: announcement,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlert({
          show: true,
          message: errorData.error || 'Error posting announcement.',
          type: 'danger',
        });
        return;
      }

      setAnnouncement('');
      setEditingAnnouncement(null);
      setAlert({ show: true, message: 'Announcement saved successfully!', type: 'success' });
      setRefresh(Date.now());
    } catch (error) {
      console.error('Error posting announcement:', error.message);
      setAlert({ show: true, message: 'Error posting announcement.', type: 'danger' });
    }
  };

  const handleSendMessage = async () => {
    if (!recipient || !messageContent) {
      setAlert({ show: true, message: 'Please select a recipient and enter a message.', type: 'danger' });
      return;
    }

    try {
      const method = editingMessage ? 'PUT' : 'POST';
      const url = editingMessage
        ? `/api/messages/${editingMessage._id}`
        : '/api/messages';

      const adminData = JSON.parse(localStorage.getItem("user"));
      const body = editingMessage
        ? { content: messageContent }
        : { receiverId: recipient, senderId: adminData?._id, content: messageContent };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setAlert({ show: true, message: 'Error saving message.', type: 'danger' });
        return;
      }

      setMessageContent('');
      setRecipient('');
      setEditingMessage(null);
      setAlert({ show: true, message: 'Message saved successfully!', type: 'success' });
      setRefresh(Date.now());
    } catch (error) {
      console.error('Error saving message:', error);
      setAlert({ show: true, message: 'Error saving message.', type: 'danger' });
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setRecipient(message.receiverId?._id || '');
    setMessageContent(message.content || '');
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncement(announcement.content);
  };

  const handleDeleteMessage = async (id, isSent) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        setAlert({ show: true, message: 'Error deleting message.', type: 'danger' });
        return;
      }

      if (isSent) {
        setSentMessages(sentMessages.filter((msg) => msg._id !== id));
      } else {
        setReceivedMessages(receivedMessages.filter((msg) => msg._id !== id));
      }

      setAlert({ show: true, message: 'Message deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting message:', error);
      setAlert({ show: true, message: 'Error deleting message.', type: 'danger' });
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        setAlert({ show: true, message: 'Error deleting announcement.', type: 'danger' });
        return;
      }

      setSentAnnouncements(sentAnnouncements.filter((announcement) => announcement._id !== id));
      setAlert({ show: true, message: 'Announcement deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setAlert({ show: true, message: 'Error deleting announcement.', type: 'danger' });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ show: false, message: '', type: '' });
  };

  return (
    <>
      <Header />
      <h2 className="admin-message-txt-center">Admin Messaging & Announcements</h2>
      <div className="container my-5 admin-message-container">
        
        {alert.show && (
          <Alert
            variant={alert.type}
            onClose={handleCloseAlert}
            dismissible
            className="admin-message-alert"
          >
            <strong>{alert.message}</strong>
          </Alert>
        )}

        <div className="filter-section mb-4">
          <label htmlFor="filterDate" className="form-label">
            <Badge bg="primary">Filter</Badge>
          </label>
          <input
            type="date"
            id="filterDate"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ width: '45px' }}
          />
        </div>

        <div className="announcement-section mt-4 p-4 rounded shadow">
          <h4><FaBullhorn className="me-2" />Post Announcement</h4>
          <textarea
            className="form-control mt-3"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Enter announcement here..."
          ></textarea>
          <button className="btn btn-primary mt-3" onClick={handlePostAnnouncement}>
            {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
          </button>
        </div>

        <div className="admin-messages-display mt-5 p-4 rounded shadow" style={{backgroundColor:'#FFFFFF'}}>
          <h4><FaInbox className="me-2" />Sent Announcements</h4>
          {filterByDate(sentAnnouncements).length > 0 ? (
            <ul className="list-group">
              {filterByDate(sentAnnouncements).map((announcement) => (
                <li
                  key={announcement._id}
                  className="message-list-group-item d-flex justify-content-between align-items-center mb-2 ms-li"
                >
                  <span>{announcement.content} <br /><small>{formatDateTime(announcement.createdAt)}</small></span>
                  <div>
                    <FaEdit
                      className="text-primary me-2"
                      onClick={() => handleEditAnnouncement(announcement)}
                    />
                    <FaTrash
                      className="text-danger"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sent announcements to display.</p>
          )}
        </div>

        <div className="messaging-section mt-5 p-4 rounded shadow">
          <h4><FaPaperPlane className="me-2" />{editingMessage ? 'Edit Message' : 'Message Patients'}</h4>
          <select
            className="form-control mt-3"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          >
            <option value="">Select a patient</option>
            {users.map((user) => (
              <option key={user.id || user._id} value={user.id || user._id}>
                {user.firstName} {user.lastName} {" - " + user?.email}
              </option>
            ))}
          </select>
          <textarea
            className="form-control mt-3"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Enter message here..."
          ></textarea>
          <button className="btn btn-success mt-3" onClick={handleSendMessage}>
            <FaPaperPlane className="me-2" /> {editingMessage ? 'Update Message' : 'Send Message'}
          </button>
        </div>

        <div className="messages-display mt-5 p-4 rounded shadow" style={{backgroundColor:'#FFFFFF'}}>
          <h4><FaInbox className="me-2" />Sent Messages</h4>
          {filterByDate(sentMessages).length > 0 ? (
            <ul className="list-group">
              {filterByDate(sentMessages).map((msg) => (
                <li
                  key={msg._id}
                  className="message-list-group-item d-flex justify-content-between align-items-center mb-2 ms-li"
                >
                  <span>To: {msg.receiverId?.lastName} - {msg.content} <br /><small>{formatDateTime(msg.createdAt)}</small></span>
                  <div>
                    <FaEdit className="text-primary me-2" onClick={() => handleEditMessage(msg)} />
                    <FaTrash
                      className="text-danger"
                      onClick={() => handleDeleteMessage(msg._id, true)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sent messages to display.</p>
          )}
        </div>

        <div className="messages-display mt-5 p-4 rounded shadow" style={{backgroundColor:'#FFFFFF'}}>
          <h4><FaInbox className="me-2" />Received Messages from Patients</h4>
          {filterByDate(receivedMessages).length > 0 ? (
            <ul className="list-group">
              {filterByDate(receivedMessages).map((msg) => (
                <li
                  key={msg._id}
                  className="message-list-group-item d-flex justify-content-between align-items-center mb-2 ms-li"
                >
                  <span>From: {msg.senderId?.lastName || 'Unknown'} - {msg.content} <br /><small>{formatDateTime(msg.createdAt)}</small></span>
                  <FaTrash
                    className="text-danger"
                    onClick={() => handleDeleteMessage(msg._id, false)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>No received messages to display.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminMessagingPage;