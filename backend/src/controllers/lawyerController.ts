import { Request, Response } from 'express';
import { Lawyer, specializationOptions } from '../models/Lawyer'; 
import { User } from '../models/User';


export const getAllLawyers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, sortBy, order = 'asc', specialization } = req.query;

    const pipeline: any[] = [
      {
        $lookup: {
          from: User.collection.name,
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $unwind: '$userData'
      }
    ];

    const matchStage: any = {};
    if (q && typeof q === 'string' && q.trim() !== '') {
      const searchRegex = new RegExp(q, 'i');
      matchStage.$or = [
        { 'userData.name': searchRegex },
        { specialization: searchRegex }
      ];
    }
    if (specialization && typeof specialization === 'string' && specialization !== '') {
      matchStage.specialization = specialization;
    }
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    const sortStage: any = {};
    if (sortBy && typeof sortBy === 'string') {
      sortStage[sortBy] = order === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });
    } else {
      pipeline.push({ $sort: { 'ratings': -1 } });
    }

    pipeline.push({
      $project: {
        _id: 1,
        userId: '$userData._id',
        name: '$userData.name',
        profileImageUrl: '$userData.profileImageUrl',
        experience: 1,
        specialization: 1,
        ratings: 1,
        price: 1
      }
    });

    const lawyers = await Lawyer.aggregate(pipeline);
    res.status(200).json(lawyers);

  } catch (error) {
    console.error("Error fetching lawyers:", error);
    res.status(500).json({ msg: 'Server error while fetching lawyers' });
  }
};



export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(specializationOptions);
  } catch (error) {
    console.error("Error fetching specializations:", error);
    res.status(500).json({ msg: 'Server error while fetching specializations' });
  }
};

