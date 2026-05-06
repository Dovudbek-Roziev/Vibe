const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reason: {
    type: String,
    enum: ['spam', 'hate', 'nudity', 'violence', 'other'],
    required: true,
  },
  description: { type: String, maxlength: 500, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);