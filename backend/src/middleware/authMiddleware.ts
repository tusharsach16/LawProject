import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

interface CustomJwtPayload {
  id?: string;
  _id?: string;
  userId?: string;
  role?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Has Authorization header:', !!authHeader);
  console.log('Authorization header:', authHeader?.substring(0, 20) + '...');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid authorization header found');
    res.status(401).json({ 
      msg: 'Access denied. No token provided.',
      error: 'UNAUTHORIZED' 
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('Token length:', token?.length);

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET not configured');
    res.status(500).json({ 
      msg: 'Server configuration error',
      error: 'JWT_SECRET_MISSING' 
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as CustomJwtPayload;
    console.log("Token decoded successfully");
    console.log("User ID from token:", decoded.id || decoded._id || decoded.userId);
    
    (req as any).user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    
    console.log('=== AUTH SUCCESS ===\n');
    next();
  } catch (err: any) {
    console.log("Token validation failed");
    console.log("Error:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ 
        msg: 'Token expired. Please log in again.',
        error: 'TOKEN_EXPIRED' 
      });
    } else if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        msg: 'Invalid token.',
        error: 'INVALID_TOKEN' 
      });
    } else {
      res.status(401).json({ 
        msg: 'Token verification failed.',
        error: 'TOKEN_VERIFICATION_FAILED' 
      });
    }
  }
};

export default authMiddleware;
