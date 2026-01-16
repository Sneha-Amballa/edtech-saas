require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store io in app so we can access it in controllers
app.set("io", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User Presence
  socket.on("register_user", async (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.join(userId); // Join personal room for notifications
      io.emit("user_status", { userId, status: "online" });
      console.log(`User ${userId} registered as online`);

      // Update pending messages to 'delivered'
      try {
        const Chat = require("./src/models/Chat");
        // Find chats where this user is student or mentor
        // And messages where sender is NOT userId and status is 'sent'

        // This query is a bit complex across all chats. 
        // Simpler: Find all chats this user is part of.
        const chats = await Chat.find({
          $or: [{ student: userId }, { mentor: userId }]
        });

        for (const chat of chats) {
          let updated = false;
          let senderToNotify = null;

          chat.messages.forEach(msg => {
            if (msg.sender.toString() !== userId && msg.status === 'sent') {
              msg.status = 'delivered';
              updated = true;
              senderToNotify = msg.sender.toString();
            }
          });

          if (updated) {
            await chat.save();
            // Notify sender that messages are delivered
            // We emit to the sender's personal room? Or just to the chat room?
            // Chat room is safest if they are watching. Personal room if they are just Global.
            if (senderToNotify) {
              io.to(senderToNotify).emit("messages_delivered", {
                chatId: chat._id,
                userId: userId, // who received it
                status: 'delivered'
              });

              // Also emit to the chat room for real-time updates if open
              io.to(chat._id.toString()).emit("messages_delivered", {
                chatId: chat._id,
                userId: userId,
                status: 'delivered'
              });
            }
          }
        }
      } catch (err) {
        console.error("Error updating pending messages:", err);
      }
    }
  });

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Typing Indicators
  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", userId);
  });

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("stop_typing", userId);
  });

  // Read Receipts (real-time propagation)
  socket.on("mark_read", ({ chatId, userId }) => {
    // This is useful if we want to confirm to others immediately without waiting for API response
    // But usually the API call handles the emit. We can keep this empty or use it as fallback.
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    let disconnectedUserId;
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        disconnectedUserId = uid;
        onlineUsers.delete(uid);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit("user_status", { userId: disconnectedUserId, status: "offline", lastSeen: new Date() });
    }
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Seed Admin User
    const User = require("./src/models/User");
    const bcrypt = require("bcryptjs");

    const seedAdmin = async () => {
      try {
        const adminEmail = "admin@edtech.com";
        const adminName = "Admin"; // User requested name "Admin"
        const existingAdmin = await User.findOne({
          $or: [{ email: adminEmail }, { name: adminName }]
        });

        if (!existingAdmin) {
          console.log("Seeding Admin User...");
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash("Admin@123", salt);

          await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
          });
          console.log("Admin User created successfully");
        } else {
          // Optional: Ensure the existing admin has the correct password/role if you want strictly enforcing
          // But for now, we just skip if exists.
          console.log("Admin User already exists");
        }
      } catch (err) {
        console.error("Error seeding admin:", err);
      }
    };
    await seedAdmin();

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error(err));


