import { Request, Response } from 'express';
import { Lawyer, specializationOptions } from '../models/Lawyer';
import { User } from '../models/User';
import { redisGet, redisSet } from '../utils/redisClient';

export const getAllLawyers = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    const { q, sortBy, order = 'asc', specialization } = req.query;

    const cacheKey = `lawyers:${q || 'all'}:${sortBy || 'ratings'}:${order}:${specialization || 'all'}`;

    const cached = await redisGet(cacheKey);

    if (cached) {
      const responseTime = Date.now() - startTime;

      res.status(200).json({
        data: JSON.parse(cached),
        cached: true,
        responseTime,
        source: 'redis'
      });
      return;
    }

    const dbStartTime = Date.now();

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

    if (sortBy && typeof sortBy === 'string') {
      pipeline.push({
        $sort: {
          [sortBy]: order === 'desc' ? -1 : 1
        }
      });
    } else {
      pipeline.push({ $sort: { ratings: -1 } });
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

    const dbQueryTime = Date.now() - dbStartTime;

    await redisSet(cacheKey, JSON.stringify(lawyers), 60);

    const totalTime = Date.now() - startTime;

    res.status(200).json({
      data: lawyers,
      cached: false,
      responseTime: totalTime,
      dbQueryTime,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ msg: 'Server error while fetching lawyers' });
  }
};

export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(specializationOptions);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ msg: 'Server error while fetching specializations' });
  }
};
