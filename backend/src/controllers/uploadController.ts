import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import streamifier from 'streamifier';

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ msg: 'No file uploaded.' });
      return;
    }

    // Upload directly from buffer (no filesystem needed)
    const uploadFromBuffer = (buffer: Buffer): Promise<any> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile_images',
            resource_type: 'image',
            transformation: [
              { width: 1500, height: 1500, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    };

    const result = await uploadFromBuffer(req.file.buffer);

    // Return the secure URL
    res.status(200).json({ 
      msg: 'Image uploaded successfully', 
      imageUrl: result.secure_url 
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      msg: 'Server error during image upload',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};