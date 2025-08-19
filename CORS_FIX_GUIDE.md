# 🔧 CORS Fix Guide for Render Deployment

## 🚨 Current Issue
Your frontend (`https://someonesdreamproject-1.onrender.com`) cannot communicate with your backend (`https://someonesdreamproject.onrender.com`) due to CORS policy restrictions.

## ✅ Solution Steps

### 1. **Update Backend Environment Variables**

In your Render dashboard for the **backend service** (`someonesdreamproject`):

1. Go to your backend service dashboard
2. Navigate to **Environment** tab
3. Add/Update these environment variables:

```
NODE_ENV=production
FRONTEND_URL=https://someonesdreamproject-1.onrender.com
```

### 2. **Update Frontend Environment Variables**

In your Render dashboard for the **frontend service** (`someonesdreamproject-1`):

1. Go to your frontend service dashboard
2. Navigate to **Environment** tab
3. Add/Update these environment variables:

```
VITE_API_BASE_URL=https://someonesdreamproject.onrender.com/api
VITE_STREAM_API_KEY=your_stream_api_key_here
```

### 3. **Redeploy Both Services**

After updating the environment variables:

1. **Backend**: Trigger a manual deploy
2. **Frontend**: Trigger a manual deploy

### 4. **Verify CORS Configuration**

The backend CORS configuration has been updated to allow:
- `https://someonesdreamproject-1.onrender.com`
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)

### 5. **Test the Fix**

After redeployment, test these endpoints:

```bash
# Test backend health
curl -H "Origin: https://someonesdreamproject-1.onrender.com" \
     https://someonesdreamproject.onrender.com/api/health

# Test CORS headers
curl -H "Origin: https://someonesdreamproject-1.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://someonesdreamproject.onrender.com/api/health
```

## 🔍 Debugging Steps

### Check Environment Variables
```bash
# Backend should have:
echo $FRONTEND_URL
# Should output: https://someonesdreamproject-1.onrender.com

# Frontend should have:
echo $VITE_API_BASE_URL
# Should output: https://someonesdreamproject.onrender.com/api
```

### Check CORS Headers
Look for these headers in the response:
- `Access-Control-Allow-Origin: https://someonesdreamproject-1.onrender.com`
- `Access-Control-Allow-Credentials: true`

### Common Issues

1. **Environment variables not set**: Make sure both services have the correct environment variables
2. **Cache issues**: Clear browser cache or test in incognito mode
3. **Service names mismatch**: Ensure service names in render.yaml match your actual deployment

## 🚀 Quick Fix Commands

If you have access to the Render CLI:

```bash
# Update backend environment
render env set FRONTEND_URL=https://someonesdreamproject-1.onrender.com --service someonesdreamproject

# Update frontend environment  
render env set VITE_API_BASE_URL=https://someonesdreamproject.onrender.com/api --service someonesdreamproject-1

# Redeploy both services
render deploy --service someonesdreamproject
render deploy --service someonesdreamproject-1
```

## 📝 Expected Result

After applying these fixes:
- ✅ No more CORS errors in browser console
- ✅ Frontend can successfully make API calls to backend
- ✅ Authentication and all features work properly
- ✅ Video calls and messaging work as expected

## 🆘 Still Having Issues?

If the problem persists:

1. **Check Render logs** for both services
2. **Verify service URLs** are correct
3. **Test with curl** to isolate frontend vs backend issues
4. **Check browser network tab** for specific error details

---

**Last Updated**: $(date)
**Status**: Ready for deployment
