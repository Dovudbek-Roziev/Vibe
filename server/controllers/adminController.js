const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Comment = require('../models/Comment');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalReports, newUsersToday] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    ]);

    // So'nggi 7 kun statistika
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const [users, posts] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Post.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      ]);
      weeklyStats.push({ date: start.toLocaleDateString('uz-UZ'), users, posts });
    }

    res.json({ totalUsers, totalPosts, totalReports, newUsersToday, weeklyStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search
      ? { $or: [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Adminni bloklash mumkin emas' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Adminni o\'chirish mumkin emas' });

    await Post.deleteMany({ author: user._id });
    await Comment.deleteMany({ author: user._id });
    await user.deleteOne();
    res.json({ message: 'Foydalanuvchi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar');

    const total = await Post.countDocuments();
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post topilmadi' });
    post.isHidden = !post.isHidden;
    await post.save();
    res.json({ isHidden: post.isHidden });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reporter', 'username avatar')
      .populate('post', '_id media')
      .populate('user', 'username avatar');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post topilmadi' });
    await post.deleteOne();
    res.json({ message: 'Post o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ message: 'Report yopildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};