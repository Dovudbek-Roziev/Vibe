const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['bug', 'suggestion', 'complaint', 'other'],
    default: 'bug',
  },
  message: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);