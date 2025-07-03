import "express";   // extend करने के लिये import ज़रूरी है

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;          // JWT से आने वाला user id
        role?: string;       // अगर token में role भेजता है
        email?: string;      // optional field
      };
    }
  }
}
