import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../models/User';
import { GeneralUser } from '../models/GeneralUser';
import { LawStudent } from '../models/LawStudent';
import { Lawyer } from '../models/Lawyer';

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
  console.log("Backend received this data:", JSON.stringify(req.body, null, 2));
  console.log("License Number in payload:", req.body.roleSpecificData?.licenseNumber);

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
    lawyer: ['experience', 'specialization', 'licenseNumber', 'price'],
  };

  const cleanSpecializationData = (specializations: string[]) => {
    if (!Array.isArray(specializations)) return [];

    const validSpecializations = [
      "Civil Law", "Criminal Law", "Corporate Law", "Family Law",
      "Intellectual Property", "Real Estate Law", "Tax Law",
      "Immigration Law", "Labor Law", "Environmental Law"
    ];

    const mapping: { [key: string]: string } = {
      "Criminal": "Criminal Law",
      "Civil": "Civil Law",
      "Corporate": "Corporate Law",
      "Family": "Family Law",
      "Real Estate": "Real Estate Law",
      "Tax": "Tax Law",
      "Immigration": "Immigration Law",
      "Labor": "Labor Law",
      "Environmental": "Environmental Law"
    };

    return specializations.map(spec => {
      if (validSpecializations.includes(spec)) return spec;
      if (mapping[spec]) return mapping[spec];
      return null;
    }).filter(spec => spec !== null) as string[];
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

      console.log("safeRoleData AFTER pick:", safeRoleData);

      if (userRole === 'lawyer' && 'specialization' in safeRoleData && Array.isArray(safeRoleData.specialization)) {
        safeRoleData.specialization = cleanSpecializationData(safeRoleData.specialization);
        console.log('Cleaned specialization data:', safeRoleData.specialization);
      }

      if (userRole === 'lawstudent' && 'areaOfInterest' in safeRoleData && Array.isArray(safeRoleData.areaOfInterest)) {
        safeRoleData.areaOfInterest = cleanSpecializationData(safeRoleData.areaOfInterest);
        console.log('Cleaned areaOfInterest data:', safeRoleData.areaOfInterest);
      }

      if (userRole === 'lawyer') {
        let existingLawyerCheck = await (RoleModel as mongoose.Model<any>)
          .findOne({ userId: new mongoose.Types.ObjectId(userId) })
          .session(session);

        console.log("Existing lawyer licenseNumber:", existingLawyerCheck?.licenseNumber);
        console.log("Is licenseNumber in safeRoleData:", 'licenseNumber' in safeRoleData);
        console.log("safeRoleData.licenseNumber value:", safeRoleData.licenseNumber);

        if (existingLawyerCheck?.licenseNumber &&
          existingLawyerCheck.licenseNumber.trim() !== '' &&
          'licenseNumber' in safeRoleData) {
          delete safeRoleData.licenseNumber;
          console.log("Deleted licenseNumber - already set to:", existingLawyerCheck.licenseNumber);
        }

        console.log("safeRoleData AFTER licenseNumber check:", safeRoleData);

        if ('price' in safeRoleData) {
          if (safeRoleData.price === '' || safeRoleData.price === null) {
            delete safeRoleData.price;
          } else {
            safeRoleData.price = Number(safeRoleData.price);
          }
        }

        console.log("FINAL safeRoleData to save:", safeRoleData);
      }

      if (Object.keys(safeRoleData).length > 0) {
        let roleDocument = await (RoleModel as mongoose.Model<any>).findOne({ userId: new mongoose.Types.ObjectId(userId) }).session(session);

        if (roleDocument) {
          console.log("roleDocument BEFORE update:", roleDocument.toObject());
          Object.keys(safeRoleData).forEach(key => {
            roleDocument[key] = safeRoleData[key];
          });
          await roleDocument.save({ session });
          console.log(`Updated existing ${userRole} document.`);
          console.log("roleDocument AFTER update:", roleDocument.toObject());
        } else {
          await (RoleModel as mongoose.Model<any>).create([{ ...safeRoleData, userId: new mongoose.Types.ObjectId(userId) }], { session });
          console.log(`Created new ${userRole} document.`);
        }
      } else {
        console.log("WARNING: No data to save - safeRoleData is empty");
      }
    }

    await session.commitTransaction();

    const fullUserProfile = await getFullUserProfile(
      (updatedUser._id as mongoose.Types.ObjectId).toString()
    );
    res.status(200).json({
      msg: 'Profile updated successfully!',
      user: fullUserProfile
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateProfile:", error);
    res.status(500).json({ msg: 'Server error while updating profile', error: (error as Error).message });
  } finally {
    session.endSession();
  }
};