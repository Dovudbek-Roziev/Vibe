const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  text: { type: String, maxlength: 200, default: '' },
  textColor: { type: String, default: '#ffffff' },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 soat
    index: { expireAfterSeconds: 0 }, // MongoDB TTL — avtomatik o'chadi
  },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);