const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getIO } = require('../socket/socketHandler');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'username avatar fullName isOnline lastSeen')
      .populate('lastMessage');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate('participants', 'username avatar fullName isOnline lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, userId] });
      await conversation.populate('participants', 'username avatar fullName isOnline lastSeen');
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar');

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Suhbat topilmadi' });

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text,
      media: req.file ? { url: req.file.path, type: req.file.mimetype.startsWith('video') ? 'video' : 'image' } : undefined,
    });

    await message.populate('sender', 'username avatar');

    // Oxirgi xabar va unread count yangilash
    const recipientId = conversation.participants.find(p => !p.equals(req.user._id));
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      $inc: { [`unreadCount.${recipientId}`]: 1 },
      updatedAt: new Date(),
    });

    // Real-time yuborish
    const io = getIO();
    io.to(conversationId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${req.user._id}`]: 0,
    });
    res.json({ message: 'O\'qildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};