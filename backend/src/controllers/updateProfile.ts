import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../models/User';
import { GeneralUser } from '../models/GeneralUser';
import { LawStudent } from '../models/LawStudent';
import { Lawyer } from '../models/Lawyer';

// Helper function to get the complete user profile (common + role-specific data)
const getFullUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) return null;

  let roleData: any = {};
  switch (user.role) {
    case 'general':
      roleData = await GeneralUser.findOne({ userId: user._id }).lean();
      break;
    case 'lawstudent':
      roleData = await LawStudent.findOne({ userId: user._id }).lean();
      break;
    case 'lawyer':
      roleData = await Lawyer.findOne({ userId: user._id }).lean();
      break;
  }
  return { ...user, roleData: roleData || {} };
};

// Helper function to whitelist fields
const pick = (obj: any, keys: string[]) => {
  const newObj: any = {};
  keys.forEach(key => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

// Map roles to Mongoose models
const roleModelMap = {
  general: GeneralUser,
  lawstudent: LawStudent,
  lawyer: Lawyer,
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  console.log("Backend received this data:", JSON.stringify(req.body, null, 2));

  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ msg: 'Unauthenticated' });
    return;
  }

  const { commonData, roleSpecificData } = req.body;
  
  const allowedCommonFields = ['name', 'lastname', 'bio', 'location', 'profileImageUrl', 'bannerImageUrl'];
  const safeCommonData = pick(commonData, allowedCommonFields);
  
  const allowedRoleSpecificFields = {
    general: ['interests'],
    lawstudent: ['collegeName', 'year', 'enrollmentNumber', 'areaOfInterest'],
    lawyer: ['experience', 'specialization', 'licenseNumber'],
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

    // Image deletion logic
    if (oldProfileImageUrl && oldProfileImageUrl !== updatedUser.profileImageUrl) {
      const publicId = oldProfileImageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`profile_images/${publicId}`);
      }
    }
    if (oldBannerImageUrl && oldBannerImageUrl !== updatedUser.bannerImageUrl) {
      const publicId = oldBannerImageUrl.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`profile_images/${publicId}`);
      }
    }

    const userRole = updatedUser.role as keyof typeof roleModelMap;
    if (roleSpecificData && Object.keys(roleSpecificData).length > 0 && roleModelMap[userRole]) {
      const RoleModel = roleModelMap[userRole];
      const safeRoleData = pick(roleSpecificData, allowedRoleSpecificFields[userRole]);

      // If the frontend sends an empty string for licenseNumber, we convert it to null.
      // This ensures the sparse index works correctly for both null values and empty strings.
      if (userRole === 'lawyer' && safeRoleData.licenseNumber === '') {
          safeRoleData.licenseNumber = null;
      }

      if (Object.keys(safeRoleData).length > 0) {
        let roleDocument = await (RoleModel as mongoose.Model<any>).findOne({ userId: new mongoose.Types.ObjectId(userId) }).session(session);
        
        if (roleDocument) {
          Object.assign(roleDocument, safeRoleData);
          await roleDocument.save({ session });
          console.log(`Updated existing ${userRole} document.`);
        } else {
          await (RoleModel as mongoose.Model<any>).create([{ ...safeRoleData, userId: new mongoose.Types.ObjectId(userId) }], { session });
          console.log(`Created new ${userRole} document.`);
        }
      }
    }
    
    await session.commitTransaction();
    
    const fullUserProfile = await getFullUserProfile(updatedUser._id.toString());
    
    res.status(200).json({ 
      msg: 'Profile updated successfully!', 
      user: fullUserProfile 
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateProfile:", error);
    res.status(500).json({ msg: 'Server error while updating profile' });
  } finally {
    session.endSession();
  }
};

