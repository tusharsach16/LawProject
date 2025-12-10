import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { User, Iuser } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { LawStudent } from '../models/LawStudent';
import { GeneralUser } from '../models/GeneralUser';

// --- HELPER FUNCTION  ---
const getFullUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password').lean<Iuser>();
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

// --- SIGNUP CONTROLLER ---
const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastname, username, email, phoneNumber, password, role, ...extraData } = req.body;

    const existingUser: Iuser | null = await User.findOne({ $or: [{ email }, { username }] });
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
      role,
    });

    const userId = user._id as mongoose.Types.ObjectId;

    try {
      if (role === 'lawyer') {
        await Lawyer.create({ userId, ...extraData });
        console.log('Lawyer profile created');
      } else if (role === 'lawstudent') {
        await LawStudent.create({ userId, ...extraData });
        console.log('LawStudent profile created');
      } else {
        await GeneralUser.create({ userId, ...extraData });
        console.log('GeneralUser profile created');
      }
    } catch (roleError) {
      console.error('Error creating role-specific profile:', roleError);
      await User.findByIdAndDelete(userId);
      res.status(500).json({ message: 'Failed to create user profile' });
      return;
    }

    const token = jwt.sign(
      { id: userId.toString(), role: user.role, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    const fullUserProfile = await getFullUserProfile(userId.toString());

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: fullUserProfile,
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- LOGIN CONTROLLER ---
const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user: Iuser | null = await User.findOne({ email });
    if (!user || !(user.comparePassword && (await user.comparePassword(password)))) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const userId = user._id as mongoose.Types.ObjectId;

    const fullUserProfile = await getFullUserProfile(userId.toString());

    const token = jwt.sign(
      { id: userId.toString(), role: user.role, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: fullUserProfile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- GET USER CONTROLLER ---
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
    console.error('GetUser Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getUser, signupUser, loginUser };
