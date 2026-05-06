const router = require('express').Router();
const { addComment, getComments, deleteComment, likeComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:postId', protect, getComments);
router.post('/:postId', protect, addComment);
router.post('/like/:id', protect, likeComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
