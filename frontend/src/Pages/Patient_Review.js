//UserReviewsPage.js------------------corrected ----------------10.12.2024
import React, { useState, useEffect } from 'react';
import './Css/Patient_Reviews.css';
import Header from './Componets/Patientdashboard_Header';
import Footer from './Componets/Footer';
import Alert from 'react-bootstrap/Alert';
import RatingStars from './Componets/RatingStars';
import axios from 'axios';

const PatientReviewsPage = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [doctor, setDoctor] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Fetch services and reviews on component mount
  useEffect(() => {
    const fetchServicesAndReviews = async () => {
      try {
        const [reviewsResponse, servicesResponse] = await Promise.all([
          axios.get('/api/reviews', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get('/api/services'), // Fetch services from backend
        ]);

        setReviews(reviewsResponse.data);
        setServices(servicesResponse.data); // Store services
      } catch (error) {
        console.error('Error fetching data:', error.response || error.message);
        setAlert({
          show: true,
          message: 'Failed to fetch data. Please try again later.',
          type: 'danger',
        });
      }
    };

    fetchServicesAndReviews();
  }, []);

  // Automatically set doctor name when a service is selected
  const handleServiceChange = (e) => {
    const selectedServiceId = e.target.value;
    setSelectedService(selectedServiceId);

    // Find the corresponding doctor
    const selected = services.find((service) => service._id === selectedServiceId);
    setDoctor(selected ? selected.doctorName : '');
  };

  // Submit a new review
  const handleSubmitReview = async () => {
    if (!rating || !feedback || !selectedService) {
      setAlert({
        show: true,
        message: 'Please provide a service, rating, and feedback.',
        type: 'danger',
      });
      return;
    }

    try {
      const { data } = await axios.post(
        '/api/reviews',
        { rating, feedback, serviceId: selectedService, doctor },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setReviews([...reviews, data.review]);
      setRating(0);
      setFeedback('');
      setSelectedService('');
      setDoctor('');
      setAlert({ show: true, message: 'Review submitted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error submitting review:', error.response || error.message);
      setAlert({
        show: true,
        message: 'Failed to submit review. Please try again.',
        type: 'danger',
      });
    }

    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 2000);
  };

  return (
    <>
      <Header />
      <h2 className="patient-review-txt-center">Send Ratings and Reviews</h2>
      <div className="patient-review-container my-5">
        {alert.show && (
          <Alert
            variant={alert.type}
            onClose={() => setAlert({ show: false })}
            dismissible
            className="Patient-Review-Alert mb-4"
          >
            <strong>{alert.message}</strong>
          </Alert>
        )}

        <div className="review-form shadow p-4 mb-5 bg-light rounded">
          <h4 className="mb-3">Submit Your Review</h4>

          {/* Service Dropdown */}
          <div className="mb-3">
            <label className="form-label">Service:</label>
            <select
              className="form-select"
              value={selectedService}
              onChange={handleServiceChange}
            >
              <option value="">Select a Service</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.serviceName}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Field */}
          <div className="mb-3">
            <label className="form-label">Doctor:</label>
            <input
              className="form-control"
              type="text"
              value={doctor}
              placeholder="Doctor's Name"
              readOnly
            />
          </div>

          {/* Rating */}
          <div className="mb-3">
            <label className="form-label">Select Rating:</label>
            <select
              className="form-select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value="0">Select Rating</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Review:</label>
            <textarea
              className="form-control"
              value={
                feedback ||
                (selectedService && doctor
                  ? `🔸Service :- ${services
                    .find((s) => s._id === selectedService)
                    ?.serviceName.toUpperCase()} \n 🔸Doctor :- ${doctor.toUpperCase()}\n 🖋️    -  `
                  : '')
              }
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              rows="4"
            ></textarea>
          </div>



          <button className="btn btn-primary" onClick={handleSubmitReview}>
            Submit Review
          </button>
        </div>

        <div className="reviews-list">
          <h4 className="mb-3">Submitted Reviews</h4>
          <ul className="list-group">
            {reviews.map((review) => (
              <li key={review._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>
                      Rating:
                      <RatingStars rating={review.rating} />
                    </strong>
                    <p className="mb-0">{review.feedback}</p>
                    <p className="mb-0">
                      <strong>Likes:</strong> {review.likes}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PatientReviewsPage;
