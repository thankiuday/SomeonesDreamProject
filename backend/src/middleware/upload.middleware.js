import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("⚠️ Cloudinary credentials not found. File uploads will not work.");
  console.warn("Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file");
}

// Configure Cloudinary storage
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: "faculty-messages",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt", "ppt", "pptx"],
      transformation: [
        { width: 1000, height: 1000, crop: "limit" }, // Limit image dimensions
        { quality: "auto" }, // Auto-optimize quality
      ],
    },
  });
} else {
  // Fallback to memory storage if Cloudinary is not configured
  storage = multer.memoryStorage();
}

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  }
  // Allow documents
  else if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "text/plain" ||
    file.mimetype === "application/vnd.ms-powerpoint" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    cb(null, true);
  }
  // Reject other file types
  else {
    cb(new Error("Unsupported file type"), false);
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
