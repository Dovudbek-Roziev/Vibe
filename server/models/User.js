const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  fullName: { type: String, trim: true, maxlength: 50 },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  website: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  language: { type: String, enum: ['uz', 'ru'], default: 'uz' },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);