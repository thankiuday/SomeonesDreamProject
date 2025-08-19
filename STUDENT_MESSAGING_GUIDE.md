# Student Faculty Messaging System Guide

## Overview

The Student Faculty Messaging System allows students to receive and view messages, files, and video call links sent by their teachers (faculty members) in real-time.

## How Students Receive Faculty Messages

### 1. **Real-Time Message Delivery**
- Messages are delivered instantly through Stream Chat channels
- Students receive notifications for new messages
- Messages are stored in the local database for persistence

### 2. **Message Types Students Can Receive**

#### **Text Messages**
- Regular text messages from faculty
- System notifications and announcements
- Personalized messages from teachers

#### **File Attachments**
- **Images**: Photos, diagrams, charts, screenshots
- **Documents**: PDFs, Word documents, PowerPoint presentations
- **Other Files**: Text files, spreadsheets, etc.

#### **Video Call Links**
- Direct links to video call sessions
- Custom titles for video calls
- One-click access to join calls

### 3. **Message Sources**
- **Room Messages**: Messages sent to all members of a classroom room
- **Personal Messages**: Direct messages sent specifically to the student
- **System Messages**: Automated notifications and announcements

## Student Dashboard Features

### **Faculty Messages Section**
- **Real-time Updates**: Messages refresh automatically every 30 seconds
- **Message History**: View all received messages with timestamps
- **Message Types**: Visual indicators for different message types
- **File Downloads**: Direct download/view buttons for attachments
- **Video Call Access**: One-click buttons to join video calls

### **Message Display Features**
- **Sender Information**: Teacher name, email, and room context
- **Message Metadata**: Type, timestamp, and room association
- **Content Preview**: Text content with proper formatting
- **File Handling**: Download/view options for attachments
- **Video Call Integration**: Direct access to video call links

### **Notification System**
- **Unread Message Badge**: Shows count of new messages
- **Visual Indicators**: Red badges and notification dots
- **Real-time Updates**: Automatic refresh of message status

## How to Access Faculty Messages

### **Step 1: Join a Classroom Room**
1. Navigate to the "Join Classroom Room" section
2. Enter the 6-character invite code from your teacher
3. Click "Join Classroom Room"
4. Wait for confirmation

### **Step 2: View Faculty Messages**
1. Go to the "Faculty Messages" section on your dashboard
2. Messages will appear automatically
3. Click "Refresh" to manually update messages
4. Use the notification badge to see new message count

### **Step 3: Interact with Messages**
- **Text Messages**: Read the content directly
- **Files**: Click "Download File" or "View Image"
- **Video Calls**: Click "Join Video Call" to open the link

## Message Organization

### **Chronological Order**
- Messages are sorted by date/time (newest first)
- Recent messages are highlighted
- Clear timestamps for each message

### **Room Context**
- Each message shows which room it's from
- Teacher information is displayed
- Room-specific messages are grouped

### **Message Types**
- **Text**: Regular messages with text content
- **Image**: Visual content with download option
- **Document**: File attachments with download option
- **Video Call**: Links to video sessions

## Security and Privacy

### **Message Access**
- Only students can see messages sent to them
- Messages are encrypted in transit
- File downloads are secure and tracked

### **Parent Monitoring**
- Parents can monitor student conversations
- AI analysis provides safety insights
- Privacy is maintained while ensuring safety

## Technical Implementation

### **Backend APIs**
- `GET /api/faculty-messaging/student-messages` - Fetch student messages
- `GET /api/faculty-messaging/room/:roomId/messages` - Get room messages
- Real-time updates via Stream Chat integration

### **Frontend Components**
- `FacultyMessagesViewer` - Main message display component
- `useUnreadFacultyMessages` - Hook for tracking unread messages
- Real-time polling every 30 seconds

### **Database Storage**
- Messages stored in MongoDB with proper indexing
- File URLs stored for Cloudinary integration
- Message metadata for tracking and organization

## Troubleshooting

### **No Messages Appearing**
1. Check if you've joined any classroom rooms
2. Verify your teacher has sent messages
3. Try refreshing the page
4. Check your internet connection

### **Files Not Downloading**
1. Ensure you have proper permissions
2. Check if the file URL is accessible
3. Try opening in a new tab
4. Contact support if issues persist

### **Video Call Links Not Working**
1. Verify the link is valid
2. Check if the call session is active
3. Ensure you have proper permissions
4. Try copying the link manually

## Best Practices

### **For Students**
- Check messages regularly for updates
- Download important files promptly
- Join video calls on time
- Keep your dashboard updated

### **For Teachers**
- Send clear, concise messages
- Use appropriate file formats
- Provide context for video calls
- Test links before sending

## Future Enhancements

### **Planned Features**
- **Read Receipts**: Track when messages are read
- **Message Search**: Search through message history
- **Message Categories**: Organize messages by type
- **Push Notifications**: Real-time browser notifications
- **Message Reactions**: Like/react to messages
- **Message Threading**: Reply to specific messages

### **Integration Possibilities**
- **Calendar Integration**: Schedule video calls
- **Assignment Tracking**: Link messages to assignments
- **Grade Notifications**: Automated grade updates
- **Attendance Tracking**: Mark attendance via messages

## Support

If you encounter any issues with the faculty messaging system:

1. **Check the FAQ section**
2. **Contact your teacher directly**
3. **Submit a support ticket**
4. **Check system status page**

---

*This system is designed to facilitate safe, efficient communication between faculty and students while maintaining appropriate privacy and security measures.*
