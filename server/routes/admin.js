const router = require('express').Router();
const { getStats, getUsers, blockUser, deleteUser, getPosts, hidePost, deletePost, getReports, resolveReport } = require('../controllers/adminController');
const { getFeedbacks, markFeedbackRead, resolveFeedback } = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.get('/posts', getPosts);
router.put('/posts/:id/hide', hidePost);
router.delete('/posts/:id', deletePost);
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);
router.get('/feedbacks', getFeedbacks);
router.put('/feedbacks/:id/read', markFeedbackRead);
router.put('/feedbacks/:id/resolve', resolveFeedback);

module.exports = router;