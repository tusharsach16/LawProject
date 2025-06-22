import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { LawStudent } from '../models/LawStudent';
import { GeneralUser } from '../models/GeneralUser';
import authMiddleware from '../middleware/authMiddleware';
const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phoneNumber, password, role, ...extraData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role
    });

    if (role === 'lawyer') {
      await Lawyer.create({ userId: user._id, ...extraData });
    } else if (role === 'lawstudent') {
      await LawStudent.create({ userId: user._id, ...extraData });
    } else {
      await GeneralUser.create({ userId: user._id, ...extraData });
    }

    res.status(201).json({ message: 'Signup successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const { password: _, ...userData } = user.toObject();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id; // Type-cast to access custom `user` property

    const user = await User.findById(userId).select('-password');
    if (!user){
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getUser, signupUser, loginUser };