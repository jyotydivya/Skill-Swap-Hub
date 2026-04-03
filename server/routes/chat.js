const router = require('express').Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Get message history for a room
router.get('/:roomId', protect, async (req, res) => {
  try {
    // Mark messages as read
    await Message.updateMany(
      { roomId: req.params.roomId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'firstName lastName profilePic')
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Persist a message to DB
router.post('/', protect, async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, sender: req.user._id });
    await msg.populate('sender', 'firstName lastName profilePic');
    res.status(201).json({ message: msg });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
