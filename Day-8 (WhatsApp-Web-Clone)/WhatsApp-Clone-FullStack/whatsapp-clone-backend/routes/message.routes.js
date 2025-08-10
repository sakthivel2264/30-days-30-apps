// routes/message.routes.js
const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

const router = express.Router();

// Get messages between two users
router.get('/:userId/:recipientId', auth, async (req, res) => {
  try {
    const { userId, recipientId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: recipientId },
        { sender: recipientId, receiver: userId }
      ]
    })
    .populate('sender', 'username')
    .populate('receiver', 'username')
    .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark messages as read
router.put('/read/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findOneAndUpdate(
      { meta_msg_id: messageId },
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

module.exports = router;
