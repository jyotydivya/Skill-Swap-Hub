const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:              { type: String, enum: ['pro', 'team'], required: true },
  amount:            { type: Number, required: true },  // in paise
  currency:          { type: String, default: 'INR' },
  razorpayOrderId:   { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  status:            { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
