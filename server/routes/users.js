const router = require('express').Router();
const { getProfile, updateProfile, followUser, searchUsers, getSuggestedUsers, savePost, getSavedPosts, getFollowers, getFollowing } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/search', protect, searchUsers);
router.get('/suggested', protect, getSuggestedUsers);
router.get('/saved', protect, getSavedPosts);
router.get('/:username', protect, getProfile);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);
router.post('/:id/follow', protect, followUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.post('/save/:postId', protect, savePost);

module.exports = router;