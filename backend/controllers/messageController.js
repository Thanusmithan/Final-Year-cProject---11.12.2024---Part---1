//controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Sender, receiver, and content are required.' });
    }

    let resolvedReceiverId = receiverId;
    if (receiverId === 'admin') {
      const admin = await User.findOne({ role: 'admin' });
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found.' });
      }
      resolvedReceiverId = admin._id;
    }

    const message = new Message({
      senderId,
      receiverId: resolvedReceiverId,
      content,
    });

    await message.save();
    res.status(201).json({ message: 'Message sent successfully.', data: message });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ error: 'Error sending message.' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId, type } = req.params;

    let filter = {};
    if (type === 'sent') {
      filter = { senderId: userId, isDeleted: false };
    } else {
      filter = { receiverId: userId, isDeleted: false };
    }

    const messages = await Message.find(filter)
      .populate('senderId receiverId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ error: 'Error fetching messages.' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Soft delete message
    const deletedMessage = await Message.findByIdAndUpdate(messageId, { isDeleted: true }, { new: true });

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json({ message: 'Message deleted successfully.', data: deletedMessage });
  } catch (error) {
    console.error('Error deleting message:', error.message);
    res.status(500).json({ error: 'Error deleting message.' });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    res.status(200).json({ message: 'Message updated successfully.', data: updatedMessage });
  } catch (error) {
    console.error('Error updating message:', error.message);
    res.status(500).json({ error: 'Error updating message.' });
  }
};
