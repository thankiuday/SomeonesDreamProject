const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data - you'll need to replace these with actual IDs from your database
const testData = {
  facultyToken: 'YOUR_FACULTY_JWT_TOKEN_HERE', // Replace with actual faculty token
  roomId: 'YOUR_ROOM_ID_HERE', // Replace with actual room ID
  targetUserId: null // Set to specific user ID if testing individual messaging
};

async function testStartFacultyVideoCall() {
  try {
    console.log('🧪 Testing Start Faculty Video Call...');
    
    const response = await axios.post(`${BASE_URL}/faculty-messaging/start-video-call`, {
      roomId: testData.roomId,
      callTitle: 'Test Faculty Video Call',
      targetUserId: testData.targetUserId
    }, {
      headers: {
        'Authorization': `Bearer ${testData.facultyToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', response.data);
    
    if (response.data.callUrl) {
      console.log('🎥 Video call URL:', response.data.callUrl);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testSendVideoCallLink() {
  try {
    console.log('🧪 Testing Send Video Call Link...');
    
    const response = await axios.post(`${BASE_URL}/faculty-messaging/send-video-call`, {
      roomId: testData.roomId,
      callUrl: 'https://meet.google.com/test-room',
      callTitle: 'Test Video Call Link',
      targetUserId: testData.targetUserId
    }, {
      headers: {
        'Authorization': `Bearer ${testData.facultyToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Faculty Video Call Tests...\n');
  
  await testStartFacultyVideoCall();
  console.log('\n' + '='.repeat(50) + '\n');
  await testSendVideoCallLink();
  
  console.log('\n✨ Tests completed!');
}

runTests();
