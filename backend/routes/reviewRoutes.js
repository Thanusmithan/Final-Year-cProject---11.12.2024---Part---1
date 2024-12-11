//routes/reviewRoutes.js--------------------------Corrected-------------10.12.2024-----------------------------------
const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /reviews - Add a new review (User-specific)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const userId = req.user?._id;

        if (!rating || !feedback) {
            return res.status(400).json({ error: 'Rating and feedback are required.' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const newReview = new Review({ userId, rating, feedback });
        await newReview.save();

        res.status(201).json({ message: 'Review submitted successfully.', review: newReview });
    } catch (err) {
        console.error('Error creating review:', err.message);
        res.status(500).json({ error: 'Internal server error.', details: err.message });
    }
});

// GET /reviews - Get all reviews
router.get('/', verifyToken, async (req, res) => {
    try {
        let reviews;
        if (req.user.role === 'admin') {
            reviews = await Review.find().populate('userId', 'firstName lastName');
        } else {
            reviews = await Review.find({ userId: req.user._id }).populate('userId', 'firstName lastName');
        }
        res.status(200).json(reviews);
    } catch (err) {
        console.error('Error fetching reviews:', err.message);
        res.status(500).json({ error: 'Failed to fetch reviews.', details: err.message });
    }
});

// PATCH /reviews/:id/like - Like a review
router.patch('/:id/like', verifyToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID.' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found.' });

        review.likes += 1;
        await review.save();

        res.status(200).json({ message: 'Review liked successfully.', review });
    } catch (err) {
        console.error('Error liking review:', err.message);
        res.status(500).json({ error: 'Failed to like review.', details: err.message });
    }
});

// PATCH /reviews/:id/respond - Admin responds to a review
router.patch('/:id/respond', verifyAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID.' });
        }

        const { response } = req.body;
        if (!response) return res.status(400).json({ error: 'Response cannot be empty.' });

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found.' });

        review.response = response;
        await review.save();

        res.status(200).json({ message: 'Response added successfully.', review });
    } catch (err) {
        console.error('Error responding to review:', err.message);
        res.status(500).json({ error: 'Failed to respond to review.', details: err.message });
    }
});

// PATCH /reviews/:id/comment - Add a comment to a review
router.patch('/:id/comment', verifyToken, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID.' });
        }

        const { comment } = req.body;
        if (!comment) return res.status(400).json({ error: 'Comment cannot be empty.' });

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found.' });

        review.comments.push(comment);
        await review.save();

        res.status(200).json({ message: 'Comment added successfully.', review });
    } catch (err) {
        console.error('Error adding comment:', err.message);
        res.status(500).json({ error: 'Failed to add comment.', details: err.message });
    }
});

// DELETE /reviews/:id - Delete a review
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid review ID.' });
        }

        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found.' });

        res.status(200).json({ message: 'Review deleted successfully.', review });
    } catch (err) {
        console.error('Error deleting review:', err.message);
        res.status(500).json({ error: 'Failed to delete review.', details: err.message });
    }
});

module.exports = router;
