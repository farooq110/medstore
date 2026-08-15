import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    business?: any;
  };
}

export interface IAuthPayload {
  id: string;
  email: string;
  role: string;
  business?: any;
}
