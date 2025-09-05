import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

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

    // Cloudinary par file upload karein
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_images', // Cloudinary mein ek folder ban jayega
      resource_type: 'image',
    });

    fs.unlink(req.file.path, (err) => {
      if (err) {
        // Sirf console mein log karein, error bhejne ki zaroorat nahi
        console.error("Failed to delete temporary file:", req.file?.path, err);
      } else {
        console.log("Successfully deleted temporary file:", req.file?.path);
      }
    });

    // Frontend ko image ka secure URL wapas bhejega
    res.status(200).json({ 
      msg: 'Image uploaded successfully', 
      imageUrl: result.secure_url 
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ msg: 'Server error during image upload' });
  }
};

