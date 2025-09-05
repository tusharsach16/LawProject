import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Multer ko batayein ki file kahan temporarily save karni hai
const upload = multer({ dest: 'uploads/' }); // 'uploads/' folder ban jayega

// Yeh naya route banayein
router.post(
  '/profile-image',
  authMiddleware,
  upload.single('profileImage'), // 'profileImage' frontend se aayega
  uploadImage
);

router.post(
  '/banner-image', 
  authMiddleware,
  upload.single('bannerImage'), // 'bannerImage'
  uploadImage 
);


export default router;