const multer = require('multer');
const { imageStorage, videoStorage, avatarStorage, storyStorage } = require('../config/cloudinary');

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadStory = multer({
  storage: storyStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = { uploadImage, uploadVideo, uploadAvatar, uploadStory };