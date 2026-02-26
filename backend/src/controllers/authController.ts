import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { User, Iuser } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { LawStudent } from '../models/LawStudent';
import { GeneralUser } from '../models/GeneralUser';

import { redisGet, redisSet, redisDel, isRedisAvailable } from '../utils/redisClient';

const CACHE_TTL = 3600;

const getFullUserProfile = async (userId: string) => {
  const cacheKey = `user_profile:${userId}`;

  if (isRedisAvailable()) {
    const cached = await redisGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const [user, lawyerData, studentData, generalData] = await Promise.all([
    User.findById(userId).select('-password').lean<Iuser>(),
    Lawyer.findOne({ userId }).lean(),
    LawStudent.findOne({ userId }).lean(),
    GeneralUser.findOne({ userId }).lean()
  ]);

  if (!user) return null;

  let roleData: any = {};
  if (user.role === 'lawyer') roleData = lawyerData || {};
  else if (user.role === 'lawstudent') roleData = studentData || {};
  else roleData = generalData || {};

  const profile = { ...user, roleData };

  if (isRedisAvailable()) {
    await redisSet(cacheKey, JSON.stringify(profile), CACHE_TTL);
  }

  return profile;
};

const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastname, username, email, phoneNumber, password, role, ...extraData } = req.body;

    const existingUser: Iuser | null = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({ message: 'Email or Username already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user: Iuser = await User.create({
      name,
      lastname,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      role
    });

    const userId = user._id as mongoose.Types.ObjectId;

    try {
      if (role === 'lawyer') {
        await Lawyer.create({ userId, ...extraData });
      } else if (role === 'lawstudent') {
        await LawStudent.create({ userId, ...extraData });
      } else {
        await GeneralUser.create({ userId, ...extraData });
      }
    } catch (roleError) {
      await User.findByIdAndDelete(userId);
      res.status(500).json({ message: 'Failed to create user profile' });
      return;
    }

    const token = jwt.sign(
      {
        _id: user._id.toString(),
        id: userId.toString(),
        userId: user._id.toString(),
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        location: user.location,
        bannerImageUrl: user.bannerImageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();

  try {
    const { email, password } = req.body;

    const user: Iuser | null = await User.findOne({ email })
      .select('+password')
      .lean();

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const userId = user._id as mongoose.Types.ObjectId;

    const token = jwt.sign(
      {
        _id: user._id.toString(),
        id: userId.toString(),
        userId: user._id.toString(),
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        location: user.location,
        bannerImageUrl: user.bannerImageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized - Missing token' });
      return;
    }

    const fullUserProfile = await getFullUserProfile(userId);

    if (!fullUserProfile) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user: fullUserProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const invalidateUserCache = async (userId: string) => {
  if (!isRedisAvailable()) return;

  const cacheKey = `user_profile:${userId}`;
  await redisDel(cacheKey);
};

export { getUser, signupUser, loginUser };
