const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, maxlength: 2200, default: '' },
  media: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    thumbnail: { type: String, default: '' }, // video thumbnail
  }],
  type: { type: String, enum: ['post', 'reel'], default: 'post' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tags: [{ type: String }],
  location: { type: String, default: '' },
  isReported: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);