# Streamify Deployment Guide - Render

This guide will walk you through deploying the Streamify video calls and messaging platform on Render.

## Prerequisites

Before deploying, you'll need to set up the following services:

### 1. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string (MONGODB_URI)

### 2. Stream Chat (Video Calls & Messaging)
1. Go to [Stream Chat](https://getstream.io/chat/)
2. Create a free account
3. Create a new app
4. Get your API Key and API Secret

### 3. Cloudinary (File Uploads)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Fork or Clone** this repository to your GitHub account
2. **Push your code** to GitHub if you haven't already

### Step 2: Deploy Backend on Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure Backend Service**
   - **Name**: `streamify-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   Add these environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streamify?retryWrites=true&w=majority
   JWT_SECRET_KEY=your-super-secret-jwt-key-here-make-it-long-and-random
   STREAM_API_KEY=your-stream-api-key
   STREAM_API_SECRET=your-stream-api-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=https://streamify-frontend.onrender.com
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (usually 2-5 minutes)

### Step 3: Deploy Frontend on Render

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Frontend Service**
   - **Name**: `streamify-frontend`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**
   Add these environment variables:
   ```
   VITE_API_BASE_URL=https://streamify-backend.onrender.com/api
   VITE_STREAM_API_KEY=your-stream-api-key
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for the build to complete

### Step 4: Update Backend CORS

After both services are deployed, update the backend's `FRONTEND_URL` environment variable with your actual frontend URL:

```
FRONTEND_URL=https://your-frontend-app-name.onrender.com
```

### Step 5: Test Your Deployment

1. **Test Backend Health Check**
   - Visit: `https://your-backend-app-name.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend**
   - Visit your frontend URL
   - Try to sign up/login
   - Test video calls and messaging

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | Yes | `10000` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `JWT_SECRET_KEY` | Secret for JWT tokens | Yes | `your-secret-key` |
| `STREAM_API_KEY` | Stream Chat API key | Yes | `your-stream-key` |
| `STREAM_API_SECRET` | Stream Chat API secret | Yes | `your-stream-secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | `your-cloudinary-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | `your-cloudinary-secret` |
| `FRONTEND_URL` | Frontend application URL | Yes | `https://your-frontend.onrender.com` |

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | Yes | `https://your-backend.onrender.com/api` |
| `VITE_STREAM_API_KEY` | Stream Chat API key | Yes | `your-stream-key` |

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=18.0.0)
   - Check build logs in Render dashboard

2. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Ensure MongoDB Atlas IP whitelist includes Render's IPs
   - Check database user permissions

3. **CORS Errors**
   - Verify `FRONTEND_URL` is set correctly in backend
   - Check that frontend URL matches exactly

4. **Environment Variables Not Working**
   - Ensure variables are set in Render dashboard
   - Check for typos in variable names
   - Redeploy after adding new variables

### Health Check Endpoints

- **Backend Health**: `https://your-backend.onrender.com/api/health`
- **Frontend**: Your frontend URL

### Logs and Monitoring

- **View Logs**: Go to your service in Render dashboard → "Logs" tab
- **Monitor Performance**: Use Render's built-in monitoring
- **Set up Alerts**: Configure alerts for downtime

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **JWT Secret**: Use a strong, random secret key
3. **Database**: Use MongoDB Atlas with proper authentication
4. **HTTPS**: Render provides SSL certificates automatically
5. **Rate Limiting**: Already configured in the application

## Scaling

- **Free Tier**: Limited to 750 hours/month
- **Paid Plans**: Start at $7/month for unlimited usage
- **Auto-scaling**: Available on paid plans

## Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Verify all environment variables are set correctly
3. Test locally first to ensure code works
4. Check the troubleshooting section above

## Next Steps

After successful deployment:
1. Set up a custom domain (optional)
2. Configure monitoring and alerts
3. Set up automated backups for your database
4. Consider setting up CI/CD for automatic deployments
