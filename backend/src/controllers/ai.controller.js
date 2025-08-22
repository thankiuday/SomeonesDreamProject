import Message from "../models/Message.js";
import User from "../models/User.js";
import axios from "axios";
import { streamServerClient } from "../lib/stream.js";

export async function analyzeChat(req, res) {
  try {
    const { childUid, targetUid } = req.body;
    const parentId = req.user._id;

    console.log('🔍 AI Analysis Request:', {
      childUid,
      targetUid,
      parentId: parentId.toString(),
      parentRole: req.user.role
    });

    // Verify the requesting user is a parent
    if (req.user.role !== "parent") {
      return res.status(403).json({ 
        message: "Only parents can analyze chat conversations" 
      });
    }

    // Verify the child exists and is associated with the parent
    const child = await User.findById(childUid);
    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Verify the target user exists
    const targetUser = await User.findById(targetUid);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    console.log('👥 Users found:', {
      childName: child.fullName,
      childRole: child.role,
      targetName: targetUser.fullName,
      targetRole: targetUser.role
    });

    // Verify parent-child relationship
    const parent = await User.findById(parentId).select("children");
    if (!parent.children.includes(childUid)) {
      return res.status(403).json({ 
        message: "You can only analyze conversations of your linked children" 
      });
    }

    // Determine conversation type and context
    const isFriend = child.friends.includes(targetUid);
    const Room = (await import("../models/Room.js")).default;
    const sharedRooms = await Room.find({
      members: { $all: [childUid, targetUid] }
    });
    const isClassroomMember = sharedRooms.length > 0;

    console.log('📊 Conversation context:', {
      isFriend,
      isClassroomMember,
      sharedRooms: sharedRooms.length,
      targetRole: targetUser.role
    });

    // Try fetching messages directly from Stream Chat (preferred)
    const channelId = [childUid.toString(), targetUid.toString()].sort().join("-");
    console.log("🔗 Resolving Stream channel:", { channelId });

    const channel = streamServerClient.channel("messaging", channelId);

    let streamMessages = [];
    try {
      const queryRes = await channel.query({ state: true, messages: { limit: 200 } });
      // Try multiple shapes depending on SDK version
      streamMessages = queryRes?.messages || channel?.state?.messages || [];
    } catch (streamErr) {
      console.log("⚠️ Stream query failed, will fall back to Mongo messages:", streamErr.message);
    }

    // If Stream returned nothing, fall back to Mongo (in case webhooks are storing copies)
    let mongoMessages = [];
    if (!Array.isArray(streamMessages) || streamMessages.length === 0) {
      mongoMessages = await Message.find({
        $or: [
          { sender: childUid, recipient: targetUid },
          { sender: targetUid, recipient: childUid }
        ]
      })
      .populate("sender", "fullName role")
      .populate("recipient", "fullName role")
      .sort({ createdAt: 1 });
    }

    const usingStream = Array.isArray(streamMessages) && streamMessages.length > 0;
    console.log("📨 Messages found:", {
      source: usingStream ? "stream" : "mongo",
      count: usingStream ? streamMessages.length : mongoMessages.length,
    });

    if (!usingStream && mongoMessages.length === 0) {
      // Check if there are any messages in the database at all
      const totalMessages = await Message.countDocuments();
      console.log('📊 Total messages in database:', totalMessages);

      // Return a contextual analysis based on relationship type
      let sampleAnalysis = "";
      if (isFriend) {
        sampleAnalysis = `Your child ${child.fullName} is friends with ${targetUser.fullName} (${targetUser.role}). While no messages were found in this conversation, this friendship appears to be a positive social connection. The child demonstrates good social skills by maintaining friendships.`;
      } else if (isClassroomMember) {
        sampleAnalysis = `Your child ${child.fullName} shares a classroom with ${targetUser.fullName} (${targetUser.role}). This is an educational relationship that provides opportunities for collaborative learning and academic growth. No direct messages were found between them.`;
      } else {
        sampleAnalysis = `Your child ${child.fullName} has a connection with ${targetUser.fullName} (${targetUser.role}). While no direct messages were found, this could be a new acquaintance or someone they've interacted with in other contexts.`;
      }
      
      return res.status(200).json({
        success: true,
        analysis: sampleAnalysis,
        context: {
          childName: child.fullName,
          targetName: targetUser.fullName,
          targetRole: targetUser.role,
          messageCount: 0,
          isFriend,
          isClassroomMember,
          sharedRooms: sharedRooms.length,
          totalMessagesInDatabase: totalMessages,
          note: "This is a contextual analysis since no actual messages were found. Messages may not be synced from Stream Chat yet."
        }
      });
    }

    // Format messages for AI analysis
    let transcript = "";
    if (usingStream) {
      // Stream message shape: { text, user: { id }, created_at }
      const childName = child.fullName;
      const targetName = targetUser.fullName;
      const nameById = new Map([
        [childUid.toString(), childName],
        [targetUid.toString(), targetName],
      ]);

      transcript = streamMessages
        .map((m) => {
          const senderId = m.user?.id?.toString();
          const senderName = nameById.get(senderId) || senderId || "Unknown";
          const ts = new Date(m.created_at || Date.now()).toLocaleString();
          const text = m.text || "";
          return `[${ts}] ${senderName}: ${text}`;
        })
        .join("\n");
    } else {
      transcript = mongoMessages
        .map((msg) => {
          const senderName = msg.sender?.fullName || "Unknown";
          const timestamp = new Date(msg.createdAt).toLocaleString();
          return `[${timestamp}] ${senderName}: ${msg.content}`;
        })
        .join("\n");
    }

    console.log('📝 Formatted transcript length:', transcript.length);

    // Create context-aware prompt for AI analysis
    const conversationContext = {
      childName: child.fullName,
      childRole: child.role,
      targetName: targetUser.fullName,
      targetRole: targetUser.role,
      isFriend,
      isClassroomMember,
      messageCount: usingStream ? streamMessages.length : mongoMessages.length
    };

    const contextPrompt = `
Context: This is a conversation between ${child.fullName} (${child.role}) and ${targetUser.fullName} (${targetUser.role}).
Relationship: ${isFriend ? 'Friends' : isClassroomMember ? 'Classroom members' : 'Acquaintances'}
Message count: ${conversationContext.messageCount}
`;

    // Call OpenAI API with enhanced prompt
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a child safety and communication expert. Analyze this conversation between a child and another person. Consider the context, relationship type, and provide insights about:
1. Communication patterns and social skills
2. Emotional well-being and behavior
3. Safety concerns or red flags
4. Educational value (if applicable)
5. Overall assessment of the interaction

Be thorough but concise. Focus on actionable insights for parents.`
          },
          {
            role: "user",
            content: `${contextPrompt}\n\nConversation transcript:\n${transcript}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const analysis = openaiResponse.data.choices[0].message.content;

    console.log('✅ AI analysis completed successfully');

    res.status(200).json({
      success: true,
      analysis,
      context: {
        ...conversationContext,
        source: usingStream ? "stream" : "mongo",
        transcriptLength: transcript.length
      }
    });

  } catch (error) {
    console.error("Error in analyzeChat controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
