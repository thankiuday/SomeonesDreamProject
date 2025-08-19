import Room from "../models/Room.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { streamServerClient } from "../lib/stream.js";

// Generate a unique invite code
const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if invite code already exists
const isInviteCodeUnique = async (inviteCode) => {
  const existingRoom = await Room.findOne({ inviteCode });
  return !existingRoom;
};

export async function createRoom(req, res) {
  try {
    const { roomName } = req.body;
    const facultyId = req.user._id;

    // Generate a unique invite code
    let inviteCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      inviteCode = generateInviteCode();
      isUnique = await isInviteCodeUnique(inviteCode);
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: "Failed to generate unique invite code" });
    }

    const newRoom = await Room.create({
      roomName,
      faculty: facultyId,
      inviteCode,
      members: [facultyId], // Faculty is automatically a member
    });

    // Populate faculty details
    await newRoom.populate("faculty", "fullName email");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    console.log("Error in createRoom controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinRoom(req, res) {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    // Find room by invite code
    const room = await Room.findOne({ inviteCode });
    if (!room) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // Check if user is already a member
    if (room.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this room" });
    }

    // Add user to room members
    room.members.push(userId);
    await room.save();

    // Populate room details
    await room.populate("faculty", "fullName email");
    await room.populate("members", "fullName email role");

    res.status(200).json({
      success: true,
      message: "Successfully joined the room",
      room,
    });
  } catch (error) {
    console.log("Error in joinRoom controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFacultyRooms(req, res) {
  try {
    const facultyId = req.user._id;

    const rooms = await Room.find({ faculty: facultyId })
      .populate("faculty", "fullName email")
      .populate("members", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.log("Error in getFacultyRooms controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getStudentRooms(req, res) {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({ members: userId })
      .populate("faculty", "fullName email")
      .populate("members", "fullName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.log("Error in getStudentRooms controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getRoomMembers(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Find the room and verify user is a member
    const room = await Room.findById(roomId)
      .populate("faculty", "fullName email profilePic role")
      .populate("members", "fullName email profilePic role");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if user is a member of this room
    const isMember = room.members.some(member => member._id.toString() === userId.toString()) ||
                    room.faculty._id.toString() === userId.toString();

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    // Return all members including faculty
    // Filter out faculty from members array to avoid duplication
    const membersWithoutFaculty = room.members.filter(member => 
      member._id.toString() !== room.faculty._id.toString()
    );
    
    const allMembers = [
      {
        ...room.faculty.toObject(),
        isFaculty: true
      },
      ...membersWithoutFaculty.map(member => ({
        ...member.toObject(),
        isFaculty: false
      }))
    ];

    res.status(200).json({
      success: true,
      members: allMembers,
      roomName: room.roomName
    });
  } catch (error) {
    console.log("Error in getRoomMembers controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Send message to all room members
export async function sendRoomMessage(req, res) {
  try {
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
      const channel = streamServerClient.channel("messaging", channelId, {
        members: [facultyId.toString(), targetUserId]
      });

      await channel.sendMessage({
        text: message,
        user_id: facultyId.toString()
      });

      // Save to local database for AI analysis
      const newMessage = new Message({
        sender: facultyId,
        recipient: targetUserId,
        content: message,
        messageType: messageType,
        roomId: roomId
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
    for (const member of room.members) {
      if (member._id.toString() === facultyId.toString()) continue; // Skip self

      try {
        // Create direct message channel with each member
        const channelId = [facultyId.toString(), member._id.toString()].sort().join("-");
        const channel = streamServerClient.channel("messaging", channelId, {
          members: [facultyId.toString(), member._id.toString()]
        });

        await channel.sendMessage({
          text: message,
          user_id: facultyId.toString()
        });

        // Save to local database for AI analysis
        const newMessage = new Message({
          sender: facultyId,
          recipient: member._id,
          content: message,
          messageType: messageType,
          roomId: roomId
        });
        await newMessage.save();

        results.push({
          _id: member._id,
          fullName: member.fullName,
          email: member.email,
          status: "sent"
        });
      } catch (error) {
        console.error(`Failed to send message to ${member.fullName}:`, error);
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
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Send file (image/document) to room members
export async function sendRoomFile(req, res) {
  try {
    const { roomId, fileUrl, fileName, fileType, targetUserId = null } = req.body;
    const facultyId = req.user._id;

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
        members: [facultyId.toString(), targetUserId]
      });

      await channel.sendMessage({
        text: `📎 ${fileName}`,
        attachments: [{
          type: fileType === "image" ? "image" : "file",
          asset_url: fileUrl,
          title: fileName
        }],
        user_id: facultyId.toString()
      });

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
          members: [facultyId.toString(), member._id.toString()]
        });

        await channel.sendMessage({
          text: `📎 ${fileName}`,
          attachments: [{
            type: fileType === "image" ? "image" : "file",
            asset_url: fileUrl,
            title: fileName
          }],
          user_id: facultyId.toString()
        });

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

    res.status(200).json({
      success: true,
      message: "File sent to room members",
      results: results,
      totalSent: results.filter(r => r.status === "sent").length,
      totalFailed: results.filter(r => r.status === "failed").length
    });

  } catch (error) {
    console.log("Error in sendRoomFile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
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
        members: [facultyId.toString(), targetUserId]
      });

      await channel.sendMessage({
        text: videoCallMessage,
        user_id: facultyId.toString()
      });

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
          members: [facultyId.toString(), member._id.toString()]
        });

        await channel.sendMessage({
          text: videoCallMessage,
          user_id: facultyId.toString()
        });

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
    res.status(500).json({ message: "Internal Server Error" });
  }
}
