const Story = require('../models/Story');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

exports.createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Media fayl kerak' });
    const story = await Story.create({
      author: req.user._id,
      media: { url: req.file.path, publicId: req.file.filename, type: req.file.mimetype.startsWith('video') ? 'video' : 'image' },
      text: req.body.text || '',
      textColor: req.body.textColor || '#ffffff',
    });
    await story.populate('author', 'username avatar');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const authorIds = [...user.following, req.user._id];

    const stories = await Story.find({
      author: { $in: authorIds },
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar');

    // Har user uchun guruhlab berish
    const grouped = {};
    for (const story of stories) {
      const uid = story.author._id.toString();
      if (!grouped[uid]) grouped[uid] = { user: story.author, stories: [] };
      grouped[uid].stories.push(story);
    }

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewStory = async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } });
    res.json({ message: 'Ko\'rildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story topilmadi' });
    if (!story.author.equals(req.user._id))
      return res.status(403).json({ message: 'Ruxsat yo\'q' });

    await cloudinary.uploader.destroy(story.media.publicId, {
      resource_type: story.media.type === 'video' ? 'video' : 'image',
    });
    await story.deleteOne();
    res.json({ message: 'Story o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};