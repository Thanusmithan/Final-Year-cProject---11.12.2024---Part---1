//AdminReviewsPage.js
import React, { useState, useEffect } from 'react';
import Header from './Componets/Admin_Header';
import Footer from './Componets/Footer';
import './Css/Admin_Reviews.css';
import Alert from 'react-bootstrap/Alert';
import RatingStars from './Componets/RatingStars';
import { FaTrash, FaThumbsUp } from 'react-icons/fa';
import Badge from 'react-bootstrap/Badge';
import axios from 'axios';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [response, setResponse] = useState('');
  const [comment, setComment] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [deletingReview, setDeletingReview] = useState(null);

  // Fetch reviews from the backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('/api/reviews', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const sortedReviews = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(sortedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error.message);
        setAlert({ show: true, message: 'Failed to fetch reviews', type: 'danger' });
      }
    };

    fetchReviews();
  }, []);

  const formatDateTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], options)}`;
  };

  const handleDeleteReview = async (id) => {
    try {
      setDeletingReview(id); // Mark the review as deleting
  
      // Validate the token
      const token = localStorage.getItem('token');
      if (!token) {
        setAlert({ show: true, message: 'User is not authenticated.', type: 'danger' });
        setDeletingReview(null);
        return;
      }
  
      // Perform the DELETE request
      const response = await axios.delete(`/api/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        // Remove the deleted review from state
        setReviews((prevReviews) => prevReviews.filter((review) => review._id !== id));
        setAlert({ show: true, message: 'Review deleted successfully!', type: 'success' });
      } else {
        setAlert({ show: true, message: 'Failed to delete review.', type: 'danger' });
      }
    } catch (error) {
      console.error('Error deleting review:', error.response?.data || error.message);
      setAlert({
        show: true,
        message: error.response?.data?.error || 'Failed to delete review. Please try again.',
        type: 'danger',
      });
    } finally {
      setDeletingReview(null); // Reset deleting state
      setTimeout(() => setAlert({ show: false }), 2000); // Optional: Auto-dismiss alert
    }
  };
  

  const handleRespond = async (id) => {
    try {
      await axios.patch(
        `/api/reviews/${id}/respond`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const updatedReviews = reviews.map((review) =>
        review._id === id ? { ...review, response } : review
      );
      setReviews(updatedReviews);
      setResponse('');
      setAlert({ show: true, message: 'Response submitted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error responding to review:', error.message);
      setAlert({ show: true, message: 'Failed to submit response', type: 'danger' });
    }
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 2000);
  };

  const handleLikeReview = async (id) => {
    try {
      await axios.patch(
        `/api/reviews/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const updatedReviews = reviews.map((review) =>
        review._id === id ? { ...review, likes: review.likes + 1 } : review
      );
      setReviews(updatedReviews);
      setAlert({ show: true, message: 'You liked the review!', type: 'success' });
    } catch (error) {
      console.error('Error liking review:', error.message);
      setAlert({ show: true, message: 'Failed to like review', type: 'danger' });
    }
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 2000);
  };

  const filteredReviews = filterDate
    ? reviews.filter((review) => new Date(review.createdAt).toISOString().split('T')[0] === filterDate)
    : reviews;

  return (
    <>
      <Header />
      <h2 className="review-txt-center">Ratings and Reviews</h2>
      <div className="container my-5 review-container">
        {/* Alert for submission feedback */}
        {alert.show && (
          <Alert
            variant={alert.type}
            onClose={() => setAlert({ show: false })}
            dismissible
            className="admin-review-alert"
          >
            <strong>{alert.message}</strong>
          </Alert>
        )}

        {/* Filter Section */}
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
        <div className="reviews-list mt-4">
          <h4 className="mb-2">Patient Reviews</h4>
          {filteredReviews.length > 0 ? (
            <ul className="list-group">
              {filteredReviews.map((review) => (
                <li
                  key={review._id}
                  className={`list-group-item d-flex justify-content-between review-li align-items-start mb-1 ${deletingReview === review._id ? 'fade-out' : ''
                    }`}
                >
                  <div className="flex-grow-1">

                    <strong> Rating :</strong> {review?.userId?.lastName}
                    <RatingStars rating={review.rating} />

                    <p>{review.feedback}</p>
                    <p className="text-muted">Received on: {formatDateTime(review.createdAt)}</p>
                    {review.response && <p className="text-success"><strong>Response:</strong> {review.response}</p>}
                    <div className="d-flex align-items-center mt-2">
                      <button className="btn btn-primary me-2" onClick={() => handleLikeReview(review._id)}>
                        <FaThumbsUp className="me-1" /> Like ({review.likes})
                      </button>
                    </div>
                  </div>
                  <button className="btn btn-danger" onClick={() => handleDeleteReview(review._id)}>
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-left mt-3">
              <p className="text-muted">No reviews available from users yet.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminReviewsPage;
