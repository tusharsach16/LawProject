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

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      msg: 'Access denied. No token provided.',
      error: 'UNAUTHORIZED'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

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

    // Extract user ID - try different field names
    const userId = decoded._id || decoded.id || decoded.userId;

    if (!userId) {
      console.error('No user ID found in token payload');
      res.status(401).json({
        msg: 'Invalid token - no user ID',
        error: 'INVALID_TOKEN_PAYLOAD'
      });
      return;
    }

    // Store user data with BOTH _id and id for compatibility
    (req as any).user = {
      _id: userId,  // MongoDB style
      id: userId,   // Standard style
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err: any) {
    console.error('Token validation failed:', err.message);

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