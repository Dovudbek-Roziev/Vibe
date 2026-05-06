const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  media: {
    url: { type: String, default: '' },
    type: { type: String, enum: ['image', 'video', ''], default: '' },
  },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);