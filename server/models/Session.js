const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  request:      { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  scheduledAt:  { type: Date, required: true },
  duration:     { type: Number, default: 60 },   // minutes
  status: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  meetLink: { type: String, default: '' },
  notes:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
