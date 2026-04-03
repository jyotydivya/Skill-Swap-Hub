const router = require('express').Router();
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get my sessions (upcoming + past)
router.get('/my', protect, async (req, res) => {
  try {
    const sessions = await Session.find({ participants: req.user._id })
      .populate('participants', 'firstName lastName profilePic rating')
      .populate('request', 'skillOffered skillWanted')
      .sort({ scheduledAt: 1 });
    res.json({ sessions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark session as complete
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, participants: req.user._id },
      { status: 'completed' },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Increment totalSessions for both participants
    await User.updateMany(
      { _id: { $in: session.participants } },
      { $inc: { totalSessions: 1 } }
    );

    res.json({ session });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
