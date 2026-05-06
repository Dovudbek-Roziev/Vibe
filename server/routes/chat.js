const router = require('express').Router();
const { getConversations, getOrCreateConversation, getMessages, sendMessage, markAsRead } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/conversations', protect, getConversations);
router.get('/conversations/:userId', protect, getOrCreateConversation);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/messages', protect, uploadImage.single('media'), sendMessage);
router.put('/:conversationId/read', protect, markAsRead);

module.exports = router;