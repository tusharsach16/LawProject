import { Request as ExpressRequest } from "express";

export interface UserPayload {
  _id: string;
  id: string;
  role?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface AuthenticatedRequest extends ExpressRequest {
  user?: UserPayload;
}
