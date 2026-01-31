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
    
    // Extract user ID - try different field names
    const userId = decoded._id || decoded.id || decoded.userId;
    console.log("User ID from token:", userId);
    
    if (!userId) {
      console.error('No user ID found in token');
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
    
    console.log('User attached to request:', {
      _id: userId,
      role: decoded.role,
      email: decoded.email
    });
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