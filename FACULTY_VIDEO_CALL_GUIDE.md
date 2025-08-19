# Faculty Video Call Feature Guide

## Overview

The Faculty Video Call feature allows faculty members to automatically start video calls and send the generated links to classroom members. This feature provides two main functionalities:

1. **Start Video Call**: Automatically generate a video call link and send it to classroom members
2. **Send Video Call Link**: Send an existing video call link to classroom members

## Features

### 1. Start Video Call (New Feature)

**What it does:**
- Automatically generates a unique video call URL
- Sends the video call link to all classroom members or specific members
- Opens the video call in a new tab for the faculty member
- Saves the message to the database for AI analysis

**How to use:**
1. Go to Faculty Dashboard
2. Click "Send Message" on any room
3. Select "Start Video Call" tab
4. Enter an optional call title
5. Choose to send to all members or specific user
6. Click "Start Video Call & Send Link"

**Quick Access:**
- Use the "Start Video Call" button directly on room cards in the Faculty Dashboard

### 2. Send Video Call Link (Existing Feature)

**What it does:**
- Sends an existing video call URL to classroom members
- Useful for external video call platforms (Google Meet, Zoom, etc.)

**How to use:**
1. Go to Faculty Dashboard
2. Click "Send Message" on any room
3. Select "Video Call Link" tab
4. Enter the video call URL and optional title
5. Choose recipients
6. Click "Send Video Call Link"

## Technical Implementation

### Backend API Endpoints

#### 1. Start Faculty Video Call
```
POST /api/faculty-messaging/start-video-call
```

**Request Body:**
```json
{
  "roomId": "room_id_here",
  "callTitle": "Optional Call Title",
  "targetUserId": "specific_user_id_or_null"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video call started and link sent to room members",
  "callId": "faculty-room_id-timestamp",
  "callUrl": "http://localhost:5173/call/faculty-room_id-timestamp",
  "results": [...],
  "totalSent": 5,
  "totalFailed": 0
}
```

#### 2. Send Video Call Link
```
POST /api/faculty-messaging/send-video-call
```

**Request Body:**
```json
{
  "roomId": "room_id_here",
  "callUrl": "https://meet.google.com/xxx-xxxx-xxx",
  "callTitle": "Optional Call Title",
  "targetUserId": "specific_user_id_or_null"
}
```

### Frontend Components

#### 1. FacultyMessaging Component
- Added new "Start Video Call" tab
- Integrated with existing messaging interface
- Supports both individual and group messaging

#### 2. FacultyDashboard Component
- Added "Start Video Call" button on room cards
- Quick access to start video calls for entire rooms

### Database Integration

- Messages are saved to the local database for AI analysis
- Stream Chat integration for real-time messaging
- Room-based targeting for classroom management

## Usage Scenarios

### Scenario 1: Quick Class Video Call
1. Faculty logs into dashboard
2. Sees their classroom rooms
3. Clicks "Start Video Call" on the desired room
4. Video call link is automatically sent to all students
5. Faculty is redirected to the video call

### Scenario 2: Individual Student Support
1. Faculty opens messaging for a room
2. Selects "Start Video Call" tab
3. Chooses "Specific User" option
4. Selects the student from dropdown
5. Starts video call for individual support

### Scenario 3: External Platform Integration
1. Faculty creates a Google Meet/Zoom meeting
2. Uses "Send Video Call Link" feature
3. Pastes the external meeting URL
4. Sends to classroom members

## Security Features

- Faculty can only start video calls for their own rooms
- Proper authentication and authorization checks
- Input validation for all parameters
- Rate limiting and error handling

## Error Handling

- Invalid room ID validation
- Faculty ownership verification
- Target user existence checks
- Stream Chat integration error handling
- Database operation error handling

## Testing

Use the provided test file `test-faculty-video-call.js` to test the functionality:

1. Replace test data with actual values:
   - `facultyToken`: Valid faculty JWT token
   - `roomId`: Valid room ID owned by the faculty
   - `targetUserId`: Optional specific user ID

2. Run the test:
   ```bash
   node test-faculty-video-call.js
   ```

## Future Enhancements

1. **Scheduled Video Calls**: Allow faculty to schedule video calls for future times
2. **Video Call Recording**: Integrate with video call platforms for recording
3. **Attendance Tracking**: Track which students joined the video call
4. **Multiple Platform Support**: Direct integration with Google Meet, Zoom, etc.
5. **Video Call Analytics**: Track call duration, participation, etc.

## Troubleshooting

### Common Issues

1. **"Room not found" error**
   - Verify the room ID is correct
   - Ensure the faculty owns the room

2. **"Failed to send video call link" error**
   - Check Stream Chat configuration
   - Verify user permissions

3. **Video call doesn't open**
   - Check browser popup settings
   - Verify the call URL is accessible

### Debug Steps

1. Check browser console for errors
2. Verify backend logs for API errors
3. Test with the provided test script
4. Check Stream Chat configuration
5. Verify database connectivity

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.
