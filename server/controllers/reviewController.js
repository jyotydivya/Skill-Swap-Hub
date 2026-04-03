const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { session, reviewee, rating, comment, skillSwapped } = req.body;

    // Prevent duplicate reviews
    const existing = await Review.findOne({ session, reviewer: req.user._id });
    if (existing)
      return res.status(400).json({ message: 'You already reviewed this session' });

    const review = await Review.create({
      session, reviewee, rating, comment, skillSwapped,
      reviewer: req.user._id
    });

    // Recalculate user's average rating
    const allReviews = await Review.find({ reviewee });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewee, {
      rating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length
    });

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName profilePic')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
