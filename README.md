# Streamify - Video Calls and Messaging Platform

A modern video calling and messaging platform built for educational institutions, featuring real-time communication, file sharing, and AI-powered features.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account
- Stream Chat account
- Cloudinary account

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd streamify-video-calls-master
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

**Quick Deploy on Render:**
1. Fork this repository
2. Set up MongoDB Atlas, Stream Chat, and Cloudinary
3. Deploy backend as Web Service
4. Deploy frontend as Static Site
5. Configure environment variables

## 🛠️ Features

- **Real-time Video Calls**: Powered by Stream Video SDK
- **Instant Messaging**: Group and private chats
- **File Sharing**: Secure file uploads via Cloudinary
- **User Management**: Authentication, profiles, friend system
- **Room Management**: Create and join video call rooms
- **AI Integration**: Smart features and assistance
- **Responsive Design**: Works on desktop and mobile

## 📁 Project Structure

```
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── config/         # Configuration files
│   └── package.json
├── frontend/               # React/Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities and API
│   └── package.json
└── docs/                  # Documentation
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET_KEY=your-jwt-secret
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_STREAM_API_KEY=your-stream-api-key
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Faculty Messaging Guide](./FACULTY_MESSAGING_GUIDE.md)
- [Student Messaging Guide](./STUDENT_MESSAGING_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section in the deployment guide
2. Review the logs in your hosting platform
3. Ensure all environment variables are correctly set
4. Test locally first to isolate issues
