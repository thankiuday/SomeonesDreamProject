# Faculty Video Call Troubleshooting Guide

## Issue: Black Page When Starting Video Call

If you're experiencing a black page when starting a faculty video call, follow this troubleshooting guide to identify and resolve the issue.

## Quick Diagnosis

### 1. Check Browser Console
Open the browser's Developer Tools (F12) and check the Console tab for any error messages when the video call page loads.

Common error messages and solutions:

- **"Authentication required. Please log in."**
  - Solution: Refresh the page and log in again
  - Check if cookies are enabled in your browser

- **"Failed to get video call token"**
  - Solution: Check if Stream API is properly configured
  - Verify `VITE_STREAM_API_KEY` environment variable

- **"Video call service is not configured"**
  - Solution: Contact administrator to verify Stream configuration

### 2. Check Network Tab
In Developer Tools > Network tab, look for failed requests:
- `/api/auth/me` - Authentication check
- `/api/chat/token` - Stream token generation
- Any 401/403/500 errors

## Common Issues and Solutions

### Issue 1: Authentication Problems

**Symptoms:**
- Black page with no content
- Console shows "Authentication required"

**Solutions:**
1. Clear browser cookies and cache
2. Log out and log back in
3. Check if you're logged in on the main dashboard
4. Verify the session hasn't expired

### Issue 2: Stream API Configuration

**Symptoms:**
- "Video call service is not configured" error
- "Failed to get video call token" error

**Solutions:**
1. Verify `VITE_STREAM_API_KEY` is set in frontend environment
2. Verify `STREAM_API_KEY` and `STREAM_API_SECRET` are set in backend environment
3. Check if Stream service is accessible

### Issue 3: Pop-up Blocker

**Symptoms:**
- Video call starts but no new tab opens
- "Pop-up blocked" message

**Solutions:**
1. Allow pop-ups for the website
2. Check if the video call URL was copied to clipboard
3. Manually open the video call URL

### Issue 4: Network Issues

**Symptoms:**
- "Network error" messages
- Slow loading or timeouts

**Solutions:**
1. Check internet connection
2. Try refreshing the page
3. Check if the backend server is accessible

## Step-by-Step Debugging

### Step 1: Verify Authentication
```javascript
// In browser console, check if user is authenticated
fetch('/api/auth/me', { credentials: 'include' })
  .then(res => res.json())
  .then(data => console.log('Auth status:', data))
  .catch(err => console.error('Auth error:', err));
```

### Step 2: Check Stream Token
```javascript
// In browser console, check if Stream token is available
fetch('/api/chat/token', { credentials: 'include' })
  .then(res => res.json())
  .then(data => console.log('Stream token:', data))
  .catch(err => console.error('Token error:', err));
```

### Step 3: Test Video Call URL
1. Copy the video call URL from the console or clipboard
2. Open it in a new tab manually
3. Check if the same black page appears

### Step 4: Check Environment Variables
Verify these environment variables are set:

**Frontend (.env):**
```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_STREAM_API_KEY=your-stream-api-key
```

**Backend (.env):**
```
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
FRONTEND_URL=https://your-frontend-url.com
```

## Testing the Video Call

### Manual Test
1. Log in as faculty
2. Create a room or use existing room
3. Click "Start Video Call"
4. Check console for any errors
5. Verify the new tab opens
6. Check if video call interface loads

### Automated Test
Run the test script to verify functionality:
   ```bash
cd backend
   node test-faculty-video-call.js
   ```

## Recent Fixes Applied

### 1. Improved Error Handling
- Added comprehensive error states in CallPage component
- Better error messages for different failure scenarios
- Graceful fallbacks when services are unavailable

### 2. Enhanced Loading States
- Clear loading indicators during authentication
- Better visual feedback during call initialization
- Proper background colors to prevent black screen

### 3. Authentication Validation
- Added checks for authentication state
- Retry logic for token generation
- Better handling of expired sessions

### 4. Stream Configuration Validation
- Added checks for Stream API configuration
- Better error messages for missing credentials
- Validation before attempting to start calls

## Contact Support

If you're still experiencing issues after following this guide:

1. **Collect Debug Information:**
   - Browser console errors
   - Network tab requests
   - Environment variable status
   - Steps to reproduce the issue

2. **Contact Information:**
   - Create an issue with the debug information
   - Include browser type and version
   - Mention if this is a new issue or regression

## Prevention

To prevent this issue in the future:

1. **Regular Testing:**
   - Test video calls after deployments
   - Verify environment variables are set correctly
   - Monitor for authentication issues

2. **User Education:**
   - Inform users about pop-up blockers
   - Provide clear instructions for video call usage
   - Share this troubleshooting guide

3. **Monitoring:**
   - Monitor authentication failures
   - Track video call success rates
   - Log Stream API errors for investigation
