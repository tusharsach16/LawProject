import { Request, Response } from "express";
import { User } from '../models/User';
import { Lawyer } from "../models/Lawyer";

export const getAllLawyers = async(req: Request, res: Response): Promise<void> => {
  try {
    const lawyers = await Lawyer.find({})
      .populate({
        path: 'userId',
        model: User,
        select: 'name profileImageUrl'
      })
      .lean()

      if(!lawyers) {
        res.status(404).json({msg: "No Lawyers Found"});
        return;
      }

      const lawyerProfiles = lawyers.map(lawyer => {
        const userData = lawyer.userId as any;

        return {
          _id: lawyer._id,
          userId: userData?.userId,
          name: userData?.name || 'Tushar',
          profileImageUrl: userData?.profileImageUrl,
          experience: lawyer.experience,
          specialization: lawyer.specialization,
          ratings: lawyer.ratings,
          price: lawyer.price
        };
      });

      res.status(200).json(lawyerProfiles);
  } catch(e) {
    console.error("Error fething lawyers : ", e);
    res.status(500).json({msg: "Server error while fething lawyers"});
  }
}