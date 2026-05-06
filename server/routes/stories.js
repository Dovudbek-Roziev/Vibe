const router = require('express').Router();
const { createStory, getStories, viewStory, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { uploadStory } = require('../middleware/upload');

router.get('/', protect, getStories);
router.post('/', protect, uploadStory.single('media'), createStory);
router.post('/:id/view', protect, viewStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;