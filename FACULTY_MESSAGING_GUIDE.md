# Faculty Messaging System Guide

## Overview

The Faculty Messaging System is a comprehensive feature that allows faculty members to communicate with their room members through various channels including text messages, file uploads, and video call links.

## Features Implemented

### 1. Text Messaging
- Send messages to all room members or specific individuals
- Real-time delivery through Stream Chat
- Message history stored in local database for AI analysis

### 2. File Upload & Sharing
- Support for images, documents, PDFs, and presentations
- Cloudinary integration for secure file storage
- Automatic file optimization and compression
- File size limit: 10MB per file

### 3. Video Call Links
- Share video call URLs with room members
- Custom titles for video calls
- Instant notification delivery

### 4. Targeted Communication
- Choose between sending to all room members or specific users
- User selection dropdown with member information
- Faculty role verification

## Technical Implementation

### Backend Components

#### 1. Routes (`backend/src/routes/faculty-messaging.route.js`)
- `POST /api/faculty-messaging/send-message` - Send text messages
- `POST /api/faculty-messaging/send-file` - Upload and send files
- `POST /api/faculty-messaging/send-video-call` - Send video call links

#### 2. Controller (`backend/src/controllers/faculty-messaging.controller.js`)
- `sendRoomMessage()` - Handles text message sending
- `sendRoomFile()` - Handles file upload and sharing
- `sendVideoCallLink()` - Handles video call link sharing

#### 3. Middleware (`backend/src/middleware/upload.middleware.js`)
- Cloudinary integration for file storage
- File type validation
- File size limits
- Automatic image optimization

#### 4. Cloudinary Utilities (`backend/src/lib/cloudinary.js`)
- File deletion utilities
- URL optimization
- Public ID extraction

### Frontend Components

#### 1. FacultyMessaging Component (`frontend/src/components/FacultyMessaging.jsx`)
- Modal interface for sending messages
- Tab-based navigation for different message types
- File upload interface
- User selection dropdown
- Real-time feedback and loading states

#### 2. Updated FacultyDashboard (`frontend/src/pages/FacultyDashboard.jsx`)
- "Send Message" button on each room card
- Integration with FacultyMessaging modal

#### 3. API Functions (`frontend/src/lib/api.js`)
- `sendRoomMessage()` - Send text messages
- `sendRoomFile()` - Upload and send files
- `sendVideoCallLink()` - Send video call links

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard
3. Files will be stored in the `faculty-messages` folder

### 3. Dependencies
The following packages have been added:
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage for Cloudinary

## Usage Guide

### For Faculty Members

1. **Access the Dashboard**
   - Log in as a faculty member
   - Navigate to the Faculty Dashboard

2. **Send a Message**
   - Click "Send Message" on any room card
   - Choose message type (Text, File, or Video Call)
   - Select target (All members or Specific user)
   - Fill in the required information
   - Click send

3. **File Upload**
   - Select "File/Image" tab
   - Choose a file (images, PDFs, documents supported)
   - File will be automatically uploaded to Cloudinary
   - Recipients will receive a clickable link

4. **Video Call Links**
   - Select "Video Call" tab
   - Enter video call URL (Google Meet, Zoom, etc.)
   - Add optional title
   - Send to room members

### Message Types Supported

#### Text Messages
- Plain text messages
- Emoji support
- Character limit: No specific limit

#### Files
- **Images**: JPG, JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX, TXT
- **Presentations**: PPT, PPTX
- **Size Limit**: 10MB per file

#### Video Call Links
- Any video call platform URL
- Custom titles
- Instant delivery

## Security Features

1. **Role-based Access**: Only faculty members can send messages
2. **Room Ownership**: Faculty can only send to their own rooms
3. **File Validation**: Strict file type and size validation
4. **Cloudinary Security**: Secure file storage with access controls

## Error Handling

- File upload failures
- Invalid file types
- Network errors
- User not found errors
- Room access validation

## Performance Optimizations

1. **Image Optimization**: Automatic compression and format conversion
2. **Lazy Loading**: Room members loaded on demand
3. **Caching**: React Query for efficient data fetching
4. **File Limits**: Prevents large file uploads

## Testing

Use the test file `backend/test-faculty-messaging.js` to verify functionality:

```bash
cd backend
node test-faculty-messaging.js
```

## Future Enhancements

1. **Message Templates**: Pre-defined message templates
2. **Scheduled Messages**: Send messages at specific times
3. **Message Analytics**: Track message delivery and engagement
4. **Bulk Operations**: Send to multiple rooms simultaneously
5. **File Management**: Delete and manage uploaded files
6. **Message History**: View sent message history

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check Cloudinary credentials
   - Verify file size (max 10MB)
   - Ensure file type is supported

2. **Messages Not Sending**
   - Verify faculty role
   - Check room ownership
   - Ensure Stream Chat is configured

3. **Cloudinary Errors**
   - Verify environment variables
   - Check Cloudinary account status
   - Ensure proper folder permissions

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Test with the provided test file
4. Check Cloudinary dashboard for upload status
