const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("./models/User");
const Message = require("./models/Message");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/messages", require("./routes/message.routes"));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error", err));

// Socket.IO Logic
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid Token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user?.userId;
  const username = socket.user?.username;

  if (!userId || !username) {
    console.log("Invalid socket connection: missing user info");
    return;
  }

  console.log(`${username} connected`);
  onlineUsers.set(userId, socket.id);

  // Notify others that user is online
  socket.broadcast.emit("user_status_change", {
    userId,
    status: 'online'
  });

  // Handle sending messages with status tracking
  socket.on("send_message", async ({ to, content, messageId }) => {
    try {
      // Create message with 'sent' status initially
      const message = new Message({
        sender: userId,
        receiver: to,
        content,
        meta_msg_id: messageId || uuidv4(),
        status: 'sent',
        timestamp: new Date()
      });

      console.log("Saving message:", message);
      await message.save();
      console.log("✅ Message saved to DB");

      // Send confirmation to sender that message was sent
      socket.emit("message_status", {
        messageId: message.meta_msg_id,
        status: 'sent'
      });

      // Check if recipient is online
      const recipientSocketId = onlineUsers.get(to);
      
      if (recipientSocketId) {
        // Recipient is online - deliver message
        io.to(recipientSocketId).emit("receive_message", {
          messageId: message.meta_msg_id,
          from: userId,
          to,
          content,
          timestamp: message.timestamp,
          status: 'delivered'
        });

        // Update message status to 'delivered' in database
        await Message.findOneAndUpdate(
          { meta_msg_id: message.meta_msg_id },
          { status: 'delivered' }
        );

        // Notify sender that message was delivered
        socket.emit("message_status", {
          messageId: message.meta_msg_id,
          status: 'delivered'
        });
      } else {
        // Recipient is offline, message remains as 'sent'
        console.log(`User ${to} is offline. Message will be delivered when they come online.`);
      }

    } catch (err) {
      console.error("❌ Failed to save message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle message read receipts
  socket.on("message_read", async ({ messageId, from }) => {
    try {
      // Update message status to 'read' in database
      await Message.findOneAndUpdate(
        { meta_msg_id: messageId },
        { status: 'read' }
      );

      // Find sender's socket and notify them
      const senderSocketId = onlineUsers.get(from);
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_status", {
          messageId,
          status: 'read'
        });
      }

      console.log(`Message ${messageId} marked as read`);
    } catch (err) {
      console.error("❌ Failed to update message status:", err);
    }
  });

  // Handle user coming online (deliver pending messages)
  socket.on("user_online", async () => {
    try {
      // Find all undelivered messages for this user
      const pendingMessages = await Message.find({
        receiver: userId,
        status: 'sent'
      }).populate('sender', 'username');

      // Deliver all pending messages
      for (const message of pendingMessages) {
        socket.emit("receive_message", {
          messageId: message.meta_msg_id,
          from: message.sender._id,
          to: userId,
          content: message.content,
          timestamp: message.timestamp,
          status: 'delivered'
        });

        // Update status to delivered
        await Message.findByIdAndUpdate(message._id, { status: 'delivered' });

        // Notify original sender that message was delivered
        const senderSocketId = onlineUsers.get(message.sender._id.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("message_status", {
            messageId: message.meta_msg_id,
            status: 'delivered'
          });
        }
      }

      console.log(`Delivered ${pendingMessages.length} pending messages to ${username}`);
    } catch (err) {
      console.error("❌ Failed to deliver pending messages:", err);
    }
  });

  // Handle typing indicators (bonus feature)
  socket.on("typing_start", ({ to }) => {
    const recipientSocketId = onlineUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", {
        userId,
        username,
        typing: true
      });
    }
  });

  socket.on("typing_stop", ({ to }) => {
    const recipientSocketId = onlineUsers.get(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user_typing", {
        userId,
        username,
        typing: false
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    
    // Notify others that user is offline
    socket.broadcast.emit("user_status_change", {
      userId,
      status: 'offline'
    });
    
    console.log(`${username} disconnected`);
  });
});

// Start Server
server.listen(process.env.PORT || 4000, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to the WhatsApp Clone Backend!");
});
