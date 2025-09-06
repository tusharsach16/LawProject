import { Request, Response } from 'express';
import { User } from '../../models/User';
import { GeneralUser } from '../../models/GeneralUser';
import { LawStudent } from '../../models/LawStudent';
import { Lawyer } from '../../models/Lawyer';

export const getUserProfileByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const loggedInUserId = (req as any).user?.id; // Logged-in user ki ID

    // Username se user ka common data dhoondein
    const user = await User.findOne({ username: username.toLowerCase() }).select('-password').lean();

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return; 
    }

    // User ka role-specific data dhoondein
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

    // Check karein ki logged-in user is profile wale user ko follow kar raha hai ya nahi
    const loggedInUser = await User.findById(loggedInUserId);
    const isFollowing = loggedInUser?.friends.includes(user._id);

    // Sab kuch milakar ek poora profile object banayein
    const fullUserProfile = { 
      ...user, 
      roleData: roleData || {},
      isFollowing: isFollowing || false // Frontend ko batayein ki follow status kya hai
    };

    res.status(200).json(fullUserProfile);

  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};

