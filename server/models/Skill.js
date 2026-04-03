const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, required: true, maxlength: 1000 },
  category: {
    type: String, required: true,
    enum: ['Tech', 'Design', 'Business', 'Media', 'Music', 'Language', 'Fitness', 'Cooking', 'Other']
  },
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wantsInReturn: [{ type: String }],
  tags:          [{ type: String }],
  level:         { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  mode:          { type: String, enum: ['Online', 'In-person', 'Both'], default: 'Online' },
  isFeatured:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  viewCount:     { type: Number, default: 0 },
}, { timestamps: true });

skillSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
