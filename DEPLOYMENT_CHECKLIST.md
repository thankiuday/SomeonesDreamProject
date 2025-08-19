# Deployment Checklist

Use this checklist to ensure your Streamify application is properly configured and ready for deployment on Render.

## ✅ Pre-Deployment Checklist

### 1. External Services Setup
- [ ] **MongoDB Atlas**
  - [ ] Created free cluster
  - [ ] Created database user with read/write permissions
  - [ ] Whitelisted IP addresses (or set to allow all: 0.0.0.0/0)
  - [ ] Copied connection string

- [ ] **Stream Chat**
  - [ ] Created free account
  - [ ] Created new app
  - [ ] Copied API Key and API Secret
  - [ ] Tested API credentials

- [ ] **Cloudinary**
  - [ ] Created free account
  - [ ] Copied Cloud Name, API Key, and API Secret
  - [ ] Tested file upload functionality

### 2. Code Preparation
- [ ] **Repository**
  - [ ] Code is pushed to GitHub
  - [ ] All sensitive data removed from code
  - [ ] No hardcoded credentials in files
  - [ ] .env files are in .gitignore

- [ ] **Dependencies**
  - [ ] All dependencies listed in package.json files
  - [ ] No missing or outdated packages
  - [ ] Node.js version >= 18.0.0 specified

### 3. Environment Variables
- [ ] **Backend Variables** (to be set in Render)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `MONGODB_URI` (your MongoDB connection string)
  - [ ] `JWT_SECRET_KEY` (strong random string)
  - [ ] `STREAM_API_KEY` (your Stream API key)
  - [ ] `STREAM_API_SECRET` (your Stream API secret)
  - [ ] `CLOUDINARY_CLOUD_NAME` (your Cloudinary cloud name)
  - [ ] `CLOUDINARY_API_KEY` (your Cloudinary API key)
  - [ ] `CLOUDINARY_API_SECRET` (your Cloudinary API secret)
  - [ ] `FRONTEND_URL` (will be updated after frontend deployment)

- [ ] **Frontend Variables** (to be set in Render)
  - [ ] `VITE_API_BASE_URL` (your backend URL + /api)
  - [ ] `VITE_STREAM_API_KEY` (your Stream API key)

## 🚀 Deployment Steps

### Step 1: Deploy Backend
- [ ] **Create Web Service on Render**
  - [ ] Connect GitHub repository
  - [ ] Set root directory to `backend`
  - [ ] Set build command to `npm install`
  - [ ] Set start command to `npm start`
  - [ ] Set environment variables (see above)
  - [ ] Deploy and wait for success

- [ ] **Verify Backend Deployment**
  - [ ] Health check endpoint works: `https://your-backend.onrender.com/api/health`
  - [ ] Check logs for any errors
  - [ ] Test database connection

### Step 2: Deploy Frontend
- [ ] **Create Static Site on Render**
  - [ ] Connect same GitHub repository
  - [ ] Set root directory to `frontend`
  - [ ] Set build command to `npm install && npm run build`
  - [ ] Set publish directory to `dist`
  - [ ] Set environment variables (see above)
  - [ ] Deploy and wait for success

- [ ] **Verify Frontend Deployment**
  - [ ] Site loads without errors
  - [ ] Check console for any JavaScript errors
  - [ ] Test API connection

### Step 3: Update Configuration
- [ ] **Update Backend CORS**
  - [ ] Update `FRONTEND_URL` in backend environment variables
  - [ ] Redeploy backend if necessary

- [ ] **Test Full Application**
  - [ ] User registration/login
  - [ ] Video calls
  - [ ] Messaging
  - [ ] File uploads
  - [ ] All major features

## 🔧 Post-Deployment

### Monitoring
- [ ] **Set up monitoring**
  - [ ] Enable Render's built-in monitoring
  - [ ] Set up alerts for downtime
  - [ ] Monitor resource usage

### Security
- [ ] **Security review**
  - [ ] All environment variables are set correctly
  - [ ] No sensitive data exposed
  - [ ] HTTPS is working
  - [ ] CORS is properly configured

### Performance
- [ ] **Performance testing**
  - [ ] Test video call quality
  - [ ] Test file upload speeds
  - [ ] Monitor response times
  - [ ] Check for memory leaks

## 🆘 Troubleshooting

### Common Issues
- [ ] **Build fails**
  - [ ] Check Node.js version compatibility
  - [ ] Verify all dependencies are in package.json
  - [ ] Check build logs for specific errors

- [ ] **Database connection fails**
  - [ ] Verify MongoDB URI is correct
  - [ ] Check IP whitelist in MongoDB Atlas
  - [ ] Verify database user permissions

- [ ] **CORS errors**
  - [ ] Check FRONTEND_URL is set correctly
  - [ ] Verify frontend URL matches exactly
  - [ ] Check CORS configuration in security.js

- [ ] **Environment variables not working**
  - [ ] Verify variables are set in Render dashboard
  - [ ] Check for typos in variable names
  - [ ] Redeploy after adding new variables

### Health Checks
- [ ] **Backend health**: `https://your-backend.onrender.com/api/health`
- [ ] **Frontend**: Your frontend URL
- [ ] **Database**: Check MongoDB Atlas dashboard
- [ ] **Stream Chat**: Test API credentials

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## ✅ Final Verification

Before considering deployment complete:
- [ ] All features work as expected
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Performance is acceptable
- [ ] Security measures are in place
- [ ] Monitoring is configured
- [ ] Backup strategy is in place (if needed)

---

**Note**: This checklist should be completed for each deployment to ensure consistency and reliability.
