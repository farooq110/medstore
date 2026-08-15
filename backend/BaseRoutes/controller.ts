import { Router, Request, Response } from "express";

const router = Router();

export const verifyUser = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required",
    });
  }
  next();
};

export const checkUser = (req: Request, res: Response, next: any) => {
  next();
};

export default { verifyUser, checkUser };
