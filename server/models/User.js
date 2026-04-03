const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:     { type: String, required: true, trim: true },
  lastName:      { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 8 },
  bio:           { type: String, maxlength: 500, default: '' },
  location:      { type: String, default: '' },
  profilePic:    { type: String, default: '' },
  skillsOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  skillsWanted:  [{ type: String }],
  isPremium:     { type: Boolean, default: false },
  premiumPlan:   { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
  isVerified:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  role:          { type: String, enum: ['user', 'admin'], default: 'user' },
  rating:        { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
