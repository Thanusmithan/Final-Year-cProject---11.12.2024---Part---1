//controllers/announcementController.js-------------10.12.2024 ----corrected
const Announcement = require('../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // Create announcement
    const announcement = new Announcement({
      adminId: req.user._id, // Assuming user information is stored in req.user
      title,
      content,
    });

    await announcement.save();
    res.status(201).json({ message: 'Announcement created successfully.', data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error.message);
    res.status(500).json({ error: 'Error creating announcement.' });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .select('-isDeleted'); // Exclude the `isDeleted` field
    res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error.message);
    res.status(500).json({ error: 'Error fetching announcements.' });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    // Check if announcement exists
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    // Soft delete
    announcement.isDeleted = true;
    await announcement.save();

    res.status(200).json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    console.error('Error deleting announcement:', error.message);
    res.status(500).json({ error: 'Error deleting announcement.' });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      { content },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    res.status(200).json({ message: 'Announcement updated successfully.', data: updatedAnnouncement });
  } catch (error) {
    console.error('Error updating announcement:', error.message);
    res.status(500).json({ error: 'Error updating announcement.' });
  }
};
