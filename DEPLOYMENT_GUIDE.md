# Deployment Guide

## Overview
This guide explains how to deploy the Streamify application to production on Render.

## Prerequisites
- Git repository with your code
- Render account
- Environment variables configured

## Deployment Steps

### 1. Prepare Your Code
Make sure your code includes the latest fixes:
- ✅ API routing fix in `backend/src/server.js`
- ✅ Frontend build process in `backend/package.json`
- ✅ Build command in `backend/render.yaml`

### 2. Build Frontend Locally (Optional)
```bash
cd frontend
npm install
npm run build
```

### 3. Deploy to Render

#### Option A: Automatic Deployment
1. Push your changes to your Git repository
2. Render will automatically detect changes and deploy
3. Monitor the deployment logs in Render dashboard

#### Option B: Manual Deployment
1. Go to your Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

### 4. Verify Deployment

#### Check API Endpoints
```bash
# Health check
curl https://your-app.onrender.com/api/health

# Should return:
# {"status":"OK","message":"Server is running","timestamp":"..."}
```

#### Check Frontend
- Visit `https://your-app.onrender.com/`
- Should load the React application

#### Check Theme API
```bash
# Theme endpoint (should return 401 without auth)
curl https://your-app.onrender.com/api/users/theme

# Should return:
# {"message":"Unauthorized - No token provided"}
```

## Troubleshooting

### API Returns HTML Instead of JSON
**Problem**: API endpoints return HTML redirect page instead of JSON
**Solution**: 
1. Ensure the latest server.js code is deployed
2. Check that API routes are defined before static file serving
3. Verify the catch-all route properly skips API routes

### Frontend Not Loading
**Problem**: Frontend shows 404 or build error
**Solution**:
1. Check Render build logs for frontend build errors
2. Ensure `npm run build` completes successfully
3. Verify the `dist` directory exists in the frontend folder

### Build Fails
**Problem**: Render build process fails
**Solution**:
1. Check the build command in `render.yaml`
2. Ensure all dependencies are in `package.json`
3. Check Node.js version compatibility

## Environment Variables
Make sure these are set in Render:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET_KEY`
- `STREAM_API_KEY`
- `STREAM_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Monitoring
- Check Render logs for any errors
- Monitor API response times
- Verify theme persistence functionality
- Test user authentication flow

## Rollback
If deployment fails:
1. Go to Render dashboard
2. Select your service
3. Go to "Deploys" tab
4. Click "Rollback" on the previous successful deployment
