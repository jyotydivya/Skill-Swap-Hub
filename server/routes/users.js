const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skillsOffered');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update own profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['bio', 'location', 'skillsWanted', 'profilePic', 'firstName', 'lastName'];
    const updates = Object.keys(req.body)
      .filter(k => allowed.includes(k))
      .reduce((obj, k) => ({ ...obj, [k]: req.body[k] }), {});
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
