import Room from "../models/Room.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { streamServerClient } from "../lib/stream.js";

// Send message to all room members or specific user
export async function sendRoomMessage(req, res) {
  try {
    console.log("📨 Faculty message request:", {
      body: req.body,
      user: req.user._id,
      userRole: req.user.role,
      headers: req.headers
    });

    
    const { roomId, message, messageType = "text", targetUserId = null } = req.body;
    const facultyId = req.user._id;

    // Verify the room exists and faculty owns it
    const room = await Room.findById(roomId).populate("members", "fullName email");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.faculty.toString() !== facultyId.toString()) {
      return res.status(403).json({ message: "You can only send messages to your own rooms" });
    }

    // If targetUserId is provided, send to specific user only
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      // Create direct message channel with target user
      const channelId = [facultyId.toString(), targetUserId].sort().join("-");
      console.log("🔍 Creating channel with ID:", channelId);
      
      const channel = streamServerClient.channel("messaging", channelId, {
        members: [facultyId.toString(), targetUserId],
        created_by_id: facultyId.toString()
      });

      console.log("🔍 Sending message to Stream Chat...");
      const streamMessage = await channel.sendMessage({
        text: message,
        user_id: facultyId.toString()
      });
      console.log("🔍 Message sent to Stream Chat successfully");

      // Save to local database for AI analysis
      const newMessage = new Message({
        sender: facultyId,
        recipient: targetUserId,
        content: message,
        messageType: messageType,
        roomId: roomId,
        streamMessageId: streamMessage.message.id
      });
      await newMessage.save();

      return res.status(200).json({
        success: true,
        message: "Message sent to user successfully",
        targetUser: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email
        }
      });
    }

    // Send to all room members
    const results = [];
    console.log("🔍 Sending to", room.members.length, "room members");
    
    // Check if Stream Chat is properly configured
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error("❌ Stream Chat API credentials are missing");
      return res.status(500).json({
        success: false,
        message: "Stream Chat is not properly configured. Please contact administrator.",
        error: "Missing Stream Chat API credentials"
      });
    }
    
    for (const member of room.members) {
      if (member._id.toString() === facultyId.toString()) continue; // Skip self

      try {
        console.log("🔍 Sending message to member:", member.fullName);
        
        // Ensure users exist in Stream Chat before creating channels
        try {
          await streamServerClient.upsertUsers([
            {
              id: facultyId.toString(),
              name: req.user.fullName || 'Faculty Member'
            },
            {
              id: member._id.toString(),
              name: member.fullName || 'Student'
            }
          ]);
          console.log("🔍 Users upserted in Stream Chat");
        } catch (upsertError) {
          console.log("⚠️ User upsert failed, continuing with message send:", upsertError.message);
        }
        
        // Create direct message channel with each member
        const channelId = [facultyId.toString(), member._id.toString()].sort().join("-");
        console.log("🔍 Channel ID:", channelId);
        
        const channel = streamServerClient.channel("messaging", channelId, {
          members: [facultyId.toString(), member._id.toString()],
          created_by_id: facultyId.toString()
        });

        // Create the channel first
        await channel.create();
        console.log("🔍 Channel created successfully");

        console.log("🔍 Sending message...");
        const streamMessage = await channel.sendMessage({
          text: message,
          user_id: facultyId.toString()
        });
        console.log("🔍 Message sent to Stream Chat successfully");

        // Save to local database for AI analysis
        const newMessage = new Message({
          sender: facultyId,
          recipient: member._id,
          content: message,
          messageType: messageType,
          roomId: roomId,
          streamMessageId: streamMessage.message.id
        });
        await newMessage.save();

        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "sent"
        });
      } catch (error) {
        console.error(`❌ Failed to send message to ${member.fullName}:`, error);
        console.error("❌ Error details:", {
          message: error.message,
          stack: error.stack,
          memberId: member._id,
          facultyId: facultyId
        });
        
        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "failed",
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Room message sent",
      results: results,
      totalSent: results.filter(r => r.status === "sent").length,
      totalFailed: results.filter(r => r.status === "failed").length
    });

  } catch (error) {
    console.log("Error in sendRoomMessage controller", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}

// Send file (image/document) to room members
export async function sendRoomFile(req, res) {
  try {
    console.log('🔍 sendRoomFile called with:', {
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasPath: !!req.file.path,
        hasBuffer: !!req.file.buffer
      } : null,
      user: req.user._id
    });

    const { roomId, targetUserId = null } = req.body;
    const facultyId = req.user._id;
    
    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Handle both Cloudinary and memory storage
    let fileUrl;
    if (req.file.path) {
      // Cloudinary storage
      fileUrl = req.file.path;
    } else if (req.file.buffer) {
      // Memory storage - convert to base64 for temporary use
      fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else {
      return res.status(400).json({ message: "Invalid file data" });
    }
    
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    // Verify the room exists and faculty owns it
    const room = await Room.findById(roomId).populate("members", "fullName email");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.faculty.toString() !== facultyId.toString()) {
      return res.status(403).json({ message: "You can only send files to your own rooms" });
    }

    // If targetUserId is provided, send to specific user only
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      const channelId = [facultyId.toString(), targetUserId].sort().join("-");
      const channel = streamServerClient.channel("messaging", channelId, {
        members: [facultyId.toString(), targetUserId],
        created_by_id: facultyId.toString()
      });

      await channel.create();
      const streamMessage = await channel.sendMessage({
        text: `📎 ${fileName}`,
        attachments: [{
          type: fileType === "image" ? "image" : "file",
          asset_url: fileUrl,
          title: fileName
        }],
        user_id: facultyId.toString()
      });

      // Save to local database for AI analysis
      const newMessage = new Message({
        sender: facultyId,
        recipient: targetUserId,
        content: `📎 ${fileName}`,
        messageType: "file",
        roomId: roomId,
        fileUrl: fileUrl,
        fileName: fileName,
        streamMessageId: streamMessage.message.id
      });
      await newMessage.save();

      return res.status(200).json({
        success: true,
        message: "File sent to user successfully",
        targetUser: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email
        }
      });
    }

    // Send to all room members
    const results = [];
    for (const member of room.members) {
      if (member._id.toString() === facultyId.toString()) continue;

      try {
        const channelId = [facultyId.toString(), member._id.toString()].sort().join("-");
        const channel = streamServerClient.channel("messaging", channelId, {
          members: [facultyId.toString(), member._id.toString()],
          created_by_id: facultyId.toString()
        });

        await channel.create();
        const streamMessage = await channel.sendMessage({
          text: `📎 ${fileName}`,
          attachments: [{
            type: fileType === "image" ? "image" : "file",
            asset_url: fileUrl,
            title: fileName
          }],
          user_id: facultyId.toString()
        });

        // Save to local database for AI analysis
        const newMessage = new Message({
          sender: facultyId,
          recipient: member._id,
          content: `📎 ${fileName}`,
          messageType: "file",
          roomId: roomId,
          fileUrl: fileUrl,
          fileName: fileName,
          streamMessageId: streamMessage.message.id
        });
        await newMessage.save();

        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "sent"
        });
      } catch (error) {
        console.error(`Failed to send file to ${member.fullName}:`, error);
        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "failed",
          error: error.message
        });
      }
    }

    console.log('✅ File upload completed successfully');
    res.status(200).json({
      success: true,
      message: "File sent to room members",
      results: results,
      totalSent: results.filter(r => r.status === "sent").length,
      totalFailed: results.filter(r => r.status === "failed").length
    });

  } catch (error) {
    console.error("❌ Error in sendRoomFile controller", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}

// Send video call link to room members
export async function sendVideoCallLink(req, res) {
  try {
    const { roomId, callUrl, callTitle = "Video Call", targetUserId = null } = req.body;
    const facultyId = req.user._id;

    // Verify the room exists and faculty owns it
    const room = await Room.findById(roomId).populate("members", "fullName email");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.faculty.toString() !== facultyId.toString()) {
      return res.status(403).json({ message: "You can only send video call links to your own rooms" });
    }

    const videoCallMessage = `🎥 ${callTitle}\n\nJoin the video call: ${callUrl}`;

    // If targetUserId is provided, send to specific user only
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      const channelId = [facultyId.toString(), targetUserId].sort().join("-");
      const channel = streamServerClient.channel("messaging", channelId, {
        members: [facultyId.toString(), targetUserId],
        created_by_id: facultyId.toString()
      });

      await channel.create();
      const streamMessage = await channel.sendMessage({
        text: videoCallMessage,
        user_id: facultyId.toString()
      });

      // Save to local database for AI analysis
      const newMessage = new Message({
        sender: facultyId,
        recipient: targetUserId,
        content: videoCallMessage,
        messageType: "text",
        roomId: roomId,
        streamMessageId: streamMessage.message.id
      });
      await newMessage.save();

      return res.status(200).json({
        success: true,
        message: "Video call link sent to user successfully",
        targetUser: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email
        }
      });
    }

    // Send to all room members
    const results = [];
    for (const member of room.members) {
      if (member._id.toString() === facultyId.toString()) continue;

      try {
        const channelId = [facultyId.toString(), member._id.toString()].sort().join("-");
        const channel = streamServerClient.channel("messaging", channelId, {
          members: [facultyId.toString(), member._id.toString()],
          created_by_id: facultyId.toString()
        });

        await channel.create();
        const streamMessage = await channel.sendMessage({
          text: videoCallMessage,
          user_id: facultyId.toString()
        });

        // Save to local database for AI analysis
        const newMessage = new Message({
          sender: facultyId,
          recipient: member._id,
          content: videoCallMessage,
          messageType: "text",
          roomId: roomId,
          streamMessageId: streamMessage.message.id
        });
        await newMessage.save();

        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "sent"
        });
      } catch (error) {
        console.error(`Failed to send video call link to ${member.fullName}:`, error);
        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "failed",
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Video call link sent to room members",
      results: results,
      totalSent: results.filter(r => r.status === "sent").length,
      totalFailed: results.filter(r => r.status === "failed").length
    });

  } catch (error) {
    console.log("Error in sendVideoCallLink controller", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}

// Start faculty video call and send link to classroom members
export async function startFacultyVideoCall(req, res) {
  try {
    const { roomId, callTitle = "Faculty Video Call", targetUserId = null } = req.body;
    const facultyId = req.user._id;

    // Verify the room exists and faculty owns it
    const room = await Room.findById(roomId).populate("members", "fullName email");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.faculty.toString() !== facultyId.toString()) {
      return res.status(403).json({ message: "You can only start video calls for your own rooms" });
    }

    // Generate a unique call ID for this faculty video call
    const callId = `faculty-${roomId}-${Date.now()}`;
    
    // Create the video call URL
    const callUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/call/${callId}`;
    
    const videoCallMessage = `🎥 ${callTitle}\n\nI've started a video call. Join me here: ${callUrl}`;

    // If targetUserId is provided, send to specific user only
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }

      const channelId = [facultyId.toString(), targetUserId].sort().join("-");
      const channel = streamServerClient.channel("messaging", channelId, {
        members: [facultyId.toString(), targetUserId],
        created_by_id: facultyId.toString()
      });

      await channel.create();
      const streamMessage = await channel.sendMessage({
        text: videoCallMessage,
        user_id: facultyId.toString()
      });

      // Save to local database for AI analysis
      const newMessage = new Message({
        sender: facultyId,
        recipient: targetUserId,
        content: videoCallMessage,
        messageType: "text",
        roomId: roomId,
        streamMessageId: streamMessage.message.id
      });
      await newMessage.save();

      return res.status(200).json({
        success: true,
        message: "Video call started and link sent to user successfully",
        callId: callId,
        callUrl: callUrl,
        targetUser: {
          _id: targetUser._id,
          fullName: targetUser.fullName,
          email: targetUser.email
        }
      });
    }

    // Send to all room members
    const results = [];
    for (const member of room.members) {
      if (member._id.toString() === facultyId.toString()) continue;

      try {
        const channelId = [facultyId.toString(), member._id.toString()].sort().join("-");
        const channel = streamServerClient.channel("messaging", channelId, {
          members: [facultyId.toString(), member._id.toString()],
          created_by_id: facultyId.toString()
        });

        await channel.create();
        const streamMessage = await channel.sendMessage({
          text: videoCallMessage,
          user_id: facultyId.toString()
        });

        // Save to local database for AI analysis
        const newMessage = new Message({
          sender: facultyId,
          recipient: member._id,
          content: videoCallMessage,
          messageType: "text",
          roomId: roomId,
          streamMessageId: streamMessage.message.id
        });
        await newMessage.save();

        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "sent"
        });
      } catch (error) {
        console.error(`Failed to send video call link to ${member.fullName}:`, error);
        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "failed",
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Video call started and link sent to room members",
      callId: callId,
      callUrl: callUrl,
      results: results,
      totalSent: results.filter(r => r.status === "sent").length,
      totalFailed: results.filter(r => r.status === "failed").length
    });

  } catch (error) {
    console.log("Error in startFacultyVideoCall controller", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}

// Get faculty messages for a student
export async function getStudentFacultyMessages(req, res) {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const studentId = req.user._id;
    
    console.log("🔍 getStudentFacultyMessages - studentId:", studentId);
    console.log("🔍 getStudentFacultyMessages - user:", req.user);
    
    // Get all rooms where the student is a member
    const studentRooms = await Room.find({ 
      members: studentId 
    }).populate("faculty", "fullName email");
    
    console.log("🔍 getStudentFacultyMessages - studentRooms:", studentRooms.length);
    console.log("🔍 getStudentFacultyMessages - first room:", studentRooms[0]);
    
    if (studentRooms.length === 0) {
      return res.status(200).json({
        success: true,
        messages: [],
        rooms: []
      });
    }
    
    // Filter out rooms that don't have faculty or have invalid faculty
    const validRooms = studentRooms.filter(room => room.faculty && room.faculty._id);
    
    console.log("🔍 getStudentFacultyMessages - validRooms:", validRooms.length);
    console.log("🔍 getStudentFacultyMessages - validRooms faculty:", validRooms.map(r => ({ roomName: r.roomName, faculty: r.faculty?.fullName })));
    
    if (validRooms.length === 0) {
      return res.status(200).json({
        success: true,
        messages: [],
        rooms: studentRooms
      });
    }
    
    // Get faculty IDs from valid rooms
    const facultyIds = validRooms.map(room => room.faculty._id);
    
    console.log("🔍 getStudentFacultyMessages - facultyIds:", facultyIds);
    
    // Get messages sent to this student by faculty
    const messages = await Message.find({
      recipient: studentId,
      sender: { $in: facultyIds }
    })
    .populate("sender", "fullName email")
    .populate("roomId", "roomName")
    .sort({ createdAt: -1 })
    .limit(50);
    
    console.log("🔍 getStudentFacultyMessages - messages found:", messages.length);
    
    // Transform messages to include file information if present
    const transformedMessages = messages.map(message => {
      const messageObj = message.toObject();
      
      // Check if content contains file information
      if (messageObj.content.includes("📎")) {
        // Extract file information from content
        const fileMatch = messageObj.content.match(/📎 (.+)/);
        if (fileMatch) {
          messageObj.fileName = fileMatch[1];
          // For now, we'll use a placeholder URL since files are stored in Stream
          messageObj.fileUrl = "#"; // This would need to be updated with actual file URLs
        }
      }
      
      return messageObj;
    });
    
    res.status(200).json({
      success: true,
      messages: transformedMessages,
      rooms: studentRooms
    });
    
  } catch (error) {
    console.log("Error in getStudentFacultyMessages controller", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: error.message 
    });
  }
}

// Get messages for a specific room (for faculty and students)
export async function getRoomMessages(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    
    // Verify the room exists and user is a member
    const room = await Room.findById(roomId)
      .populate("faculty", "fullName email")
      .populate("members", "fullName email");
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // Check if user is faculty or member
    const isFaculty = room.faculty._id.toString() === userId.toString();
    const isMember = room.members.some(member => member._id.toString() === userId.toString());
    
    if (!isFaculty && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get messages for this room
    const messages = await Message.find({
      roomId: roomId,
      $or: [
        { recipient: userId },
        { sender: userId },
        { targetUserId: null } // Messages sent to all members
      ]
    })
    .populate("sender", "fullName email")
    .populate("recipient", "fullName email")
    .sort({ createdAt: -1 })
    .limit(100);
    
    res.status(200).json({
      success: true,
      messages: messages,
      room: room
    });
    
  } catch (error) {
    console.log("Error in getRoomMessages controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Mark message as read
export async function markMessageAsRead(req, res) {
  try {
    const { messageId } = req.params;
    const studentId = req.user._id;
    
    console.log("🔍 markMessageAsRead - messageId:", messageId);
    console.log("🔍 markMessageAsRead - studentId:", studentId);
    
    // Find the message and verify it belongs to this student
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Verify the message is for this student
    if (message.recipient.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Mark message as read
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    
    console.log("✅ Message marked as read:", messageId);
    
    res.status(200).json({
      success: true,
      message: "Message marked as read",
      messageId: messageId
    });
    
  } catch (error) {
    console.log("Error in markMessageAsRead controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
