import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Using memory storage instead of disk storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Profile image upload route
router.post(
  '/profile-image',
  authMiddleware,
  upload.single('profileImage'),
  uploadImage
);

// Banner image upload route
router.post(
  '/banner-image', 
  authMiddleware,
  upload.single('bannerImage'),
  uploadImage 
);

export default router;