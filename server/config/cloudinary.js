const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rasmlar uchun storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'socialapp/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }],
  },
});

// Videolar uchun storage
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'socialapp/videos',
    allowed_formats: ['mp4', 'mov', 'webm'],
    resource_type: 'video',
    transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }],
  },
});

// Avatar uchun storage (kichik hajm)
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'socialapp/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }],
  },
});

// Story uchun storage (rasm + video ikkalasini ham qabul qiladi)
const storyStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: 'socialapp/stories',
      allowed_formats: isVideo ? ['mp4', 'mov', 'webm'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resource_type: isVideo ? 'video' : 'image',
      transformation: [{ width: 1080, crop: 'limit', quality: 'auto' }],
    };
  },
});

module.exports = { cloudinary, imageStorage, videoStorage, avatarStorage, storyStorage };