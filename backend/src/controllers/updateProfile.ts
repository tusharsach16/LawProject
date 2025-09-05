import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../models/User';
import { GeneralUser } from '../models/GeneralUser';
import { LawStudent } from '../models/LawStudent';
import { Lawyer } from '../models/Lawyer';


const pick = (obj: any, keys: string[]) => {
  const newObj: any = {};
  keys.forEach(key => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

const roleModelMap = {
  general: GeneralUser,
  lawstudent: LawStudent,
  lawyer: Lawyer,
};


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ msg: 'Unauthenticated' });
    return;
  }

  const { commonData, roleSpecificData } = req.body;
  
  // Whitelist for common fields
  const allowedCommonFields = ['name', 'lastname', 'bio', 'location', 'profileImageUrl', 'bannerImageUrl'];
  const safeCommonData = pick(commonData, allowedCommonFields);

  // Whitelist for role-specific fields
  const allowedRoleSpecificFields = {
    general: ['interests', 'queries', 'bookmarkedLawyers', 'bookmarkedArticles'],
    lawstudent: ['collegeName', 'year', 'enrollmentNumber', 'areaOfInterest'],
    lawyer: ['experience', 'specialization'],
  };


  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldUser = await User.findById(userId).session(session);
    const oldProfileImageUrl = oldUser?.profileImageUrl;
    const oldBannerImageUrl = oldUser?.bannerImageUrl;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: safeCommonData },
      { new: true, session }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    if (oldProfileImageUrl && oldProfileImageUrl !== updatedUser.profileImageUrl) {
      const publicId = oldProfileImageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        console.log(`Deleting old profile image from Cloudinary: profile_images/${publicId}`);
        await cloudinary.uploader.destroy(`profile_images/${publicId}`);
      }
    }

    if (oldBannerImageUrl && oldBannerImageUrl !== updatedUser.bannerImageUrl) {
      const publicId = oldBannerImageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        console.log(`Deleting old banner image from Cloudinary: profile_images/${publicId}`);
        await cloudinary.uploader.destroy(`profile_images/${publicId}`);
      }
    }

    // --- YEH WALA LOGIC BHI ADD KARNA ZAROORI THA ---
    // Role-specific data update logic
    const userRole = updatedUser.role as keyof typeof roleModelMap;
    if (roleSpecificData && Object.keys(roleSpecificData).length > 0 && roleModelMap[userRole]) {
      const RoleModel = roleModelMap[userRole];
      const safeRoleData = pick(roleSpecificData, allowedRoleSpecificFields[userRole]);

      if (Object.keys(safeRoleData).length > 0) {
        await (RoleModel as mongoose.Model<any>).findOneAndUpdate(
          { userId },
          { $set: safeRoleData },
          { upsert: true, new: true, session }
        );
      }
    }
    
    await session.commitTransaction();
    
    res.status(200).json({ msg: 'Profile updated successfully!', user: updatedUser });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateProfile:", error);
    res.status(500).json({ msg: 'Server error while updating profile' });
  } finally {
    session.endSession();
  }
};

