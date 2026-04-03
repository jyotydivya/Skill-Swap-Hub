const Request = require('../models/Request');
const Session = require('../models/Session');

exports.sendRequest = async (req, res) => {
  try {
    const { to, skillOffered, skillWanted, message, proposedDate } = req.body;
    if (to === String(req.user._id))
      return res.status(400).json({ message: 'Cannot send a request to yourself' });

    const request = await Request.create({
      from: req.user._id, to, skillOffered, skillWanted, message, proposedDate
    });
    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const [incoming, outgoing] = await Promise.all([
      Request.find({ to: req.user._id })
        .populate('from', 'firstName lastName profilePic rating location')
        .sort({ createdAt: -1 }),
      Request.find({ from: req.user._id })
        .populate('to', 'firstName lastName profilePic rating location')
        .sort({ createdAt: -1 }),
    ]);
    res.json({ incoming, outgoing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const request = await Request.findOneAndUpdate(
      { _id: req.params.id, to: req.user._id, status: 'pending' },
      { status },
      { new: true }
    );
    if (!request)
      return res.status(404).json({ message: 'Request not found or already handled' });

    // Auto-create session when accepted
    if (status === 'accepted') {
      await Session.create({
        request: request._id,
        participants: [request.from, request.to],
        scheduledAt: request.proposedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
