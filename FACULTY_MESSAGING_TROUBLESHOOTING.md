# Faculty Messaging Troubleshooting Guide

## Common Issues and Solutions

### 1. 403 Forbidden Error

**Symptoms:**
- Faculty gets "403 Forbidden" when trying to send messages
- Faculty dashboard loads but messaging fails

**Causes:**
- User role is not set to "faculty"
- JWT token is invalid or expired
- Missing environment variables
- Stream Chat API credentials not configured

**Solutions:**

#### A. Check User Role
1. Verify the user has `role: "faculty"` in the database
2. Check the user's role in the authentication token
3. Ensure the user was created with faculty role

#### B. Check Environment Variables
Ensure these environment variables are set in your `.env` file:

```env
# Required for authentication
JWT_SECRET_KEY=your_jwt_secret_key_here

# Required for faculty messaging
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here

# Required for database
MONGODB_URI=mongodb://localhost:27017/streamify

# Optional for file uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### C. Verify Stream Chat Setup
1. Get Stream Chat API credentials from [Stream Dashboard](https://dashboard.getstream.io/)
2. Add credentials to your `.env` file
3. Restart the server after adding credentials

### 2. File Upload Issues

**Symptoms:**
- File uploads fail with validation errors
- "Invalid room ID format" errors

**Solutions:**
- ✅ **FIXED**: Middleware order issue resolved
- ✅ **FIXED**: Room ID conversion to string added
- ✅ **FIXED**: Validation updated for file uploads

### 3. Message Not Sending to Students

**Symptoms:**
- Faculty can send messages but students don't receive them
- Messages appear in faculty dashboard but not student dashboard

**Causes:**
- Students not added to the room
- Stream Chat channel creation failing
- Database connection issues

**Solutions:**
1. Verify students are members of the room
2. Check Stream Chat API credentials
3. Ensure database is running and accessible

### 4. Authentication Issues

**Symptoms:**
- Faculty gets logged out frequently
- JWT token errors

**Solutions:**
1. Check JWT_SECRET_KEY is set
2. Verify token expiration settings
3. Clear browser cookies and re-login

## Debugging Steps

### Step 1: Check Server Logs
Look for these debug messages in the server console:

```
🔍 protectRole middleware - user role: faculty
🔍 protectRole middleware - access granted for role: faculty
📨 Faculty message request: { userRole: 'faculty', ... }
🔍 Creating channel with ID: ...
🔍 Sending message to Stream Chat...
🔍 Message sent to Stream Chat successfully
```

### Step 2: Check Environment Variables
Run this test to verify environment setup:

```bash
cd backend
node test-faculty-auth.js
```

### Step 3: Verify User Role
Check if the faculty user has the correct role in the database:

```javascript
// In MongoDB shell or database tool
db.users.findOne({email: "faculty@example.com"})
// Should show: { role: "faculty", ... }
```

### Step 4: Test Stream Chat Connection
Verify Stream Chat API credentials are working:

```javascript
// Check if Stream client initializes without errors
console.log("🔍 Stream API Key exists:", !!process.env.STREAM_API_KEY);
console.log("🔍 Stream API Secret exists:", !!process.env.STREAM_API_SECRET);
```

## Quick Fixes

### Fix 1: Update User Role
If the user doesn't have faculty role, update it in the database:

```javascript
// Update user role to faculty
db.users.updateOne(
  {email: "faculty@example.com"},
  {$set: {role: "faculty"}}
)
```

### Fix 2: Set Environment Variables
Create a `.env` file in the backend directory with:

```env
JWT_SECRET_KEY=your_secret_key_here
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
MONGODB_URI=mongodb://localhost:27017/streamify
```

### Fix 3: Restart Server
After making changes:

```bash
cd backend
npm run dev
```

## Testing Faculty Messaging

### Test 1: Basic Authentication
```bash
cd backend
node test-faculty-auth.js
```

### Test 2: Full Faculty Flow
1. Login as faculty user
2. Create a room
3. Add students to the room
4. Try sending a text message
5. Try sending a file
6. Try sending a video call link

### Test 3: Student Reception
1. Login as a student
2. Join the faculty's room
3. Check if messages appear in Faculty Messages section
4. Test "Mark as Read" functionality

## Support

If issues persist:
1. Check server console for error messages
2. Verify all environment variables are set
3. Ensure database is running
4. Confirm Stream Chat credentials are valid
5. Test with a fresh faculty account

## Recent Fixes Applied

✅ **Fixed**: Environment variable typo (STEAM → STREAM)
✅ **Fixed**: Middleware order for file uploads
✅ **Fixed**: Room ID conversion to string
✅ **Fixed**: Added comprehensive error logging
✅ **Fixed**: Added health check endpoint
✅ **Fixed**: Added default port configuration
