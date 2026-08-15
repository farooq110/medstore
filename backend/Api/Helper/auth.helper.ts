import jwt from "jsonwebtoken";
import { AuthRequest } from "../Interface/auth.interface";
import { Response, NextFunction } from "express";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "medstore_secret";

export const generateToken = (userId: string, email: string, role: string, business?: string): string => {
  // Cast to any to avoid type mismatches between `jsonwebtoken` and its @types package
  const payload: any = { id: userId, email, role };
  if (business) {
    payload.business = business;
  }
  return jwt.sign(payload as any, JWT_SECRET as any, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  } as any) as string;
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET as any) as any;
  } catch (error) {
    return null;
  }
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (decoded && decoded.business) {
    try {
      decoded.business = new Types.ObjectId(decoded.business);
    } catch (error) {
      // If invalid ObjectId, just leave it as is or handle it
    }
  }

  decoded.id =  new Types.ObjectId(decoded.id);

  req.user = decoded;
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};
