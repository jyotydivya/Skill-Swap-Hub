const User = require('../models/User');
const Skill = require('../models/Skill');
const Request = require('../models/Request');
const Payment = require('../models/Payment');
const Session = require('../models/Session');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalSkills, pendingRequests, completedSessions, revenueAgg] =
      await Promise.all([
        User.countDocuments(),
        Skill.countDocuments({ isActive: true }),
        Request.countDocuments({ status: 'pending' }),
        Session.countDocuments({ status: 'completed' }),
        Payment.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    res.json({
      totalUsers,
      totalSkills,
      pendingRequests,
      completedSessions,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin')
      return res.status(400).json({ message: 'Cannot suspend an admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({
      message: `User ${user.isActive ? 'activated' : 'suspended'}`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
