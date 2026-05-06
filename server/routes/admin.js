const router = require('express').Router();
const { getStats, getUsers, blockUser, deleteUser, getPosts, hidePost, deletePost, getReports, resolveReport } = require('../controllers/adminController');
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

module.exports = router;