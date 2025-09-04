import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../models/User';
import { Lawyer } from '../models/Lawyer';
import { LawStudent } from '../models/LawStudent';
import { GeneralUser } from '../models/GeneralUser';

// --- HELPER FUNCTION (This is excellent!) ---
const getFullUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) {
    return null;
  }

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


const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, lastname, username, email, phoneNumber, password, role, ...extraData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, lastname, username, email, phoneNumber, password: hashedPassword, role
    });

    if (role === 'lawyer') {
      await Lawyer.create({ userId: user._id, ...extraData });
    } else if (role === 'lawstudent') {
      await LawStudent.create({ userId: user._id, ...extraData });
    } else {
      await GeneralUser.create({ userId: user._id, ...extraData });
    }

    // --- FIX 1: SIGNUP KE BAAD TOKEN CREATE KARNA ---
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );
    
    // Poora user profile fetch karein taaki frontend ko saari details mil jayein
    const fullUserProfile = await getFullUserProfile(user._id.toString());

    // --- FIX 2: TOKEN KO RESPONSE MEIN BHEJNA ---
    res.status(201).json({ 
      message: 'Signup successful', 
      token, // Ab frontend ko token mil jayega
      user: fullUserProfile 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const fullUserProfile = await getFullUserProfile(user._id.toString());

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Login successful', token, user: fullUserProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id; 

    const fullUserProfile = await getFullUserProfile(userId);

    if (!fullUserProfile){
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // --- FIX 3: API RESPONSE KO CONSISTENT BANANA ---
    // Ab frontend ko hamesha { user: {...} } milega.
    res.status(200).json({ user: fullUserProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getUser, signupUser, loginUser };