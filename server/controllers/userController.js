const User = require('../models/User');
const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username avatar fullName')
      .populate('following', 'username avatar fullName');
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    const postCount = await Post.countDocuments({ author: user._id, isHidden: false });
    res.json({ user, postCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, website, language, theme } = req.body;
    const update = { fullName, bio, website, language, theme };

    if (req.file) {
      // Eski avatarni o'chir
      if (req.user.avatarPublicId) {
        await cloudinary.uploader.destroy(req.user.avatarPublicId);
      }
      update.avatar = req.file.path;
      update.avatarPublicId = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    if (targetUser._id.equals(req.user._id))
      return res.status(400).json({ message: 'O\'zingizni follow qilib bo\'lmaydi' });

    const isFollowing = targetUser.followers.includes(req.user._id);

    if (isFollowing) {
      await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetUser._id } });
      return res.json({ following: false });
    } else {
      await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetUser._id } });
      return res.json({ following: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
      ],
      isBlocked: false,
    }).select('username fullName avatar isVerified').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id, $nin: req.user.following },
      isBlocked: false,
    }).select('username fullName avatar isVerified followers').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(req.params.postId);
    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: req.params.postId } });
      return res.json({ saved: false });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedPosts: req.params.postId } });
      return res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username fullName avatar isVerified');
    if (!user) return res.status(404).json({ message: 'Topilmadi' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username fullName avatar isVerified');
    if (!user) return res.status(404).json({ message: 'Topilmadi' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'username avatar' },
    });
    res.json(user.savedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};