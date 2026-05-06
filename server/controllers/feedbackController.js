const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Xabar matni kiritilmagan' });
    const feedback = await Feedback.create({
      user: req.user._id,
      type: type || 'bug',
      message: message.trim(),
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar fullName');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markFeedbackRead = async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { status: 'read' });
    res.json({ message: 'OK' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ message: 'OK' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};