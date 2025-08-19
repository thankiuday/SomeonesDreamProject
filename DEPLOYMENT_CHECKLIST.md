# 🚀 Deployment Checklist - CORS Fix

## 🔍 Current Status
- ❌ CORS errors preventing frontend-backend communication
- ❌ Backend returning 500 errors
- ❌ Frontend cannot authenticate or make API calls

## ✅ Step-by-Step Fix

### 1. **Backend Environment Variables** (CRITICAL)

In your Render dashboard for `someonesdreamproject`:

**Required Variables:**
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://someonesdreamproject-1.onrender.com
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### 2. **Frontend Environment Variables** (CRITICAL)

In your Render dashboard for `someonesdreamproject-1`:

**Required Variables:**
```
VITE_API_BASE_URL=https://someonesdreamproject.onrender.com/api
VITE_STREAM_API_KEY=your_stream_api_key
```

### 3. **Backend Deployment**

1. **Commit and push** the updated CORS configuration
2. **Trigger manual deploy** in Render dashboard
3. **Check deployment logs** for any errors
4. **Verify health endpoint**: `https://someonesdreamproject.onrender.com/api/health`

### 4. **Frontend Deployment**

1. **Trigger manual deploy** in Render dashboard
2. **Check deployment logs** for any errors
3. **Clear browser cache** or test in incognito mode

### 5. **Testing Steps**

#### Test Backend Health
```bash
curl https://someonesdreamproject.onrender.com/api/health
```

#### Test CORS Headers
```bash
curl -H "Origin: https://someonesdreamproject-1.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://someonesdreamproject.onrender.com/api/health
```

#### Expected Response Headers
```
Access-Control-Allow-Origin: https://someonesdreamproject-1.onrender.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,Cookie
```

### 6. **Common Issues & Solutions**

#### Issue: Backend 500 Error
**Solution:**
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs for specific error messages

#### Issue: CORS Still Blocked
**Solution:**
- Ensure `NODE_ENV=production` is set
- Verify frontend URL is exactly correct
- Clear browser cache completely

#### Issue: Frontend Can't Connect
**Solution:**
- Verify `VITE_API_BASE_URL` is correct
- Check if backend is actually running
- Test with curl first

### 7. **Verification Commands**

#### Check Environment Variables
```bash
# Backend should show:
echo $NODE_ENV
# production

echo $FRONTEND_URL  
# https://someonesdreamproject-1.onrender.com

# Frontend should show:
echo $VITE_API_BASE_URL
# https://someonesdreamproject.onrender.com/api
```

#### Test API Endpoints
```bash
# Health check
curl https://someonesdreamproject.onrender.com/api/health

# Auth endpoint (should return 401, not CORS error)
curl -H "Origin: https://someonesdreamproject-1.onrender.com" \
     https://someonesdreamproject.onrender.com/api/auth/me
```

### 8. **Final Checklist**

- [ ] Backend environment variables set correctly
- [ ] Frontend environment variables set correctly
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Health endpoint returns 200
- [ ] CORS headers present in responses
- [ ] No CORS errors in browser console
- [ ] Login functionality works
- [ ] Video calls work
- [ ] All features functional

### 9. **Emergency Fallback**

If CORS still doesn't work, temporarily allow all origins:

```javascript
// In backend/src/config/security.js
cors: {
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
},
```

**⚠️ WARNING: Only use this for testing, not production!**

---

**Status**: Ready for deployment
**Priority**: HIGH - CORS blocking all functionality
