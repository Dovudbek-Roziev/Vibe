const router = require('express').Router();
const { createFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createFeedback);

module.exports = router;