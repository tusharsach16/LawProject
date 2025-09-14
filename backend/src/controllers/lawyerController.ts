import { Request, Response } from 'express';
import { User } from '../models/User';
import { Lawyer } from '../models/Lawyer';


export const getAllLawyers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, sortBy, order = 'asc', specialization } = req.query;

    // Aggregation pipeline banayi h 
    const pipeline: any[] = [
      // Lawyer collection ko User collection se joda
      {
        $lookup: {
          from: User.collection.name,
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      // Jode hue data ko unwind kia
      {
        $unwind: '$userData'
      }
    ];

      //Match conditions (search ya filter)
    const matchStage: any = {};
    // Search by name ya specialization
    if (q && typeof q === 'string' && q.trim() !== '') {
      const searchRegex = new RegExp(q, 'i');
      matchStage.$or = [
        { 'userData.name': searchRegex },
        { specialization: searchRegex }
      ];
    }
    // Filter by specialization
    if (specialization && typeof specialization === 'string' && specialization !== '') {
      matchStage.specialization = { $in: [specialization] };
    }
    // Agar match conditions hain to unhe pipeline mein add karein
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Sorting
    const sortStage: any = {};
    if (sortBy && typeof sortBy === 'string') {
      sortStage[sortBy] = order === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortStage });
    } else {
      // Default sorting by ratings
      pipeline.push({ $sort: { 'ratings': -1 } });
    }

    // Final data ka format set karein
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

    if (!lawyers) {
      res.status(404).json({ msg: 'No lawyers found' });
      return;
    }

    res.status(200).json(lawyers);

  } catch (error) {
    console.error("Error fetching lawyers:", error);
    res.status(500).json({ msg: 'Server error while fetching lawyers' });
  }
};

