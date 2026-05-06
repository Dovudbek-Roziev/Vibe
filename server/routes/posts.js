const router = require('express').Router();
const { createPost, getFeed, getReels, getExplore, getPost, likePost, deletePost, getUserPosts, reportPost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/feed', protect, getFeed);
router.get('/reels', protect, getReels);
router.get('/explore', protect, getExplore);
router.get('/user/:username', protect, getUserPosts);
router.get('/:id', protect, getPost);
router.post('/', protect, uploadImage.array('media', 10), createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/report', protect, reportPost);
router.delete('/:id', protect, deletePost);

module.exports = router;