const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
const { getIO } = require('../socket/socketHandler');

exports.createPost = async (req, res) => {
  try {
    const { caption, tags, location, type } = req.body;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'Kamida 1 ta media fayl kerak' });

    const media = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
    }));

    const post = await Post.create({
      author: req.user._id,
      caption,
      media,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      location,
      type: type || 'post',
    });

    await post.populate('author', 'username avatar fullName isVerified');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const authorIds = [...user.following, req.user._id];

    const posts = await Post.find({ author: { $in: authorIds }, isHidden: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar fullName isVerified')
      .populate({ path: 'comments', options: { limit: 2 }, populate: { path: 'author', select: 'username avatar' } });

    const total = await Post.countDocuments({ author: { $in: authorIds }, isHidden: false });
    res.json({ posts, hasMore: skip + posts.length < total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const reels = await Post.find({ type: 'reel', isHidden: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar fullName isVerified');

    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExplore = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isHidden: false })
      .sort({ likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar');

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar fullName isVerified')
      .populate({ path: 'comments', populate: { path: 'author', select: 'username avatar' } });
    if (!post) return res.status(404).json({ message: 'Post topilmadi' });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post topilmadi' });

    const isLiked = post.likes.includes(req.user._id);
    if (isLiked) {
      await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } });
    } else {
      await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } });
      // Notification yuborish (o'ziga yubormaydi)
      if (!post.author.equals(req.user._id)) {
        await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id });
        const io = getIO();
        io.to(post.author.toString()).emit('notification', { type: 'like' });
      }
    }
    res.json({ liked: !isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post topilmadi' });
    if (!post.author.equals(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });

    for (const m of post.media) {
      await cloudinary.uploader.destroy(m.publicId, {
        resource_type: m.type === 'video' ? 'video' : 'image',
      });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    const posts = await Post.find({ author: user._id, isHidden: false, type: 'post' })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const Report = require('../models/Report');
    const { reason, description } = req.body;
    await Report.create({ reporter: req.user._id, post: req.params.id, reason, description });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { reportCount: 1 }, isReported: true });
    res.json({ message: 'Report yuborildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};