//routes/messageRoutes.js-----------------------Corrected----------------------------------------------
const express = require('express');
const {
  sendMessage,
  getMessages,
  deleteMessage,
  updateMessage, // Added an update message route
} = require('../controllers/messageController');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware'); // Authentication middleware

// Routes
/**
 * @route POST /api/messages
 * @desc Send a new message
 * @access Private (Authenticated Users)
 */
router.post('/', verifyToken, sendMessage);

/**
 * @route GET /api/messages/:userId/:type?
 * @desc Get messages for a user (sent or received)
 * @access Private (Authenticated Users)
 */
router.get('/:userId/:type?', verifyToken, getMessages);

/**
 * @route PUT /api/messages/:messageId
 * @desc Update a message
 * @access Private (Authenticated Users)
 */
router.put('/:messageId', verifyToken, updateMessage);

/**
 * @route DELETE /api/messages/:messageId
 * @desc Delete a message
 * @access Private (Authenticated Users)
 */
router.delete('/:messageId', verifyToken, deleteMessage);

module.exports = router;
