const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketHandler');

exports.addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post topilmadi' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      text,
      parentComment: parentComment || null,
    });

    await Post.findByIdAndUpdate(post._id, { $push: { comments: comment._id } });
    await comment.populate('author', 'username avatar');

    if (!post.author.equals(req.user._id)) {
      const type = parentComment ? 'reply' : 'comment';
      await Notification.create({ recipient: post.author, sender: req.user._id, type, post: post._id, comment: comment._id });
      const io = getIO();
      io.to(post.author.toString()).emit('notification', { type });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar')
      .populate({ path: 'parentComment', populate: { path: 'author', select: 'username avatar' } });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Izoh topilmadi' });
    if (!comment.author.equals(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Ruxsat yo\'q' });

    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ message: 'Izoh o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Izoh topilmadi' });

    const isLiked = comment.likes.includes(req.user._id);
    if (isLiked) {
      await Comment.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } });
    } else {
      await Comment.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } });
    }
    res.json({ liked: !isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};