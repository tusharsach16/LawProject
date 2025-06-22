import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No header found');
    res.status(401).json({ msg: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Token decoded", decoded);
    (req as any).user = decoded; // You can use declaration merging to type this properly
    next();
  } catch (err) {
    console.log("Token invalid or expired");
    res.status(401).json({ msg: 'Invalid token.' });
  }
};

export default authMiddleware;
