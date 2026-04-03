const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  from:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillOffered: { type: String, required: true },
  skillWanted:  { type: String, required: true },
  message:      { type: String, maxlength: 500, default: '' },
  proposedDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
