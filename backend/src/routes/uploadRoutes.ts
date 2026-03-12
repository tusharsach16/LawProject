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

/**
 * @openapi
 * tags:
 *   name: Uploads
 *   description: Cloudinary image upload services
 */

/**
 * @openapi
 * /api/upload/profile-image:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload a profile picture
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post(
  '/profile-image',
  authMiddleware,
  upload.single('profileImage'),
  uploadImage
);

/**
 * @openapi
 * /api/upload/banner-image:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload a profile banner image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bannerImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Banner uploaded successfully
 */
router.post(
  '/banner-image',
  authMiddleware,
  upload.single('bannerImage'),
  uploadImage
);

export default router;