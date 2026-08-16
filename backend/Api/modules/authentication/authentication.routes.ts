import { Router, Response } from "express";
import bcrypt from "bcrypt";
import User from "../../models/user.model";
import Business from "../../models/business.model";
import { authenticateToken, generateToken } from "../../Helper/auth.helper";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { createStripeCustomer } from "../../Helper/stripe.helper";
import crypto from "crypto";
import { sendEmail, generateForgotPasswordEmailHtml } from "../../Helper/mail.helper";

const router = Router();

// Register endpoint for owner (creates business too)
router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      businessName, 
      country,
      businessPhone,
      businessAddress,
      website,
      ntn,
      logo
    } = req.body;

    if (!name || !email || !password || !phone || !businessName || !country) {
      return errorResponse(res, "All fields are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User already exists with this email", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (owner)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      stripeCustomerId: "test123",
      stripeSubscriptionId: "test123",
      subscriptionStatus: "active",
      subscriptionPlan: "basic",
      role: "owner",
    });

    // Create business for this owner
    const newBusiness = await Business.create({
      name: businessName,
      owner: newUser._id,
      country,
      phone: businessPhone,
      address: businessAddress,
      website,
      ntn: ntn || undefined,
      logo: logo || undefined,
      isActive: true,
    });

    // Link user to business
    await User.findByIdAndUpdate(newUser._id, { business: newBusiness._id });

    const token = generateToken(
      newUser._id.toString(),
      newUser.email,
      newUser.role,
      newBusiness._id.toString()
    );

    return successResponse(
      res,
      {
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        },
        business: {
          _id: newBusiness._id,
          name: newBusiness.name,
          ntn: newBusiness.ntn,
          logo: newBusiness.logo,
        },
      },
      "Registration successful"
    );
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Login endpoint
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, "Invalid credentials", 400);
    }

    if (!user.isActive) {
      return errorResponse(res, "Your account has been deactivated, Please contact admin.", 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid credentials", 400);
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    let response: any = {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };

    // If owner, fetch business and include in token
    if (user.role === "owner") {
      const business = await Business.findOne({ owner: user._id }).lean();
      response.business = {
        ...business
      };
      // Regenerate token with business
      const newToken = generateToken(
        user._id.toString(),
        user.email,
        user.role,
        business?._id.toString()
      );
      response.token = newToken;
    } else if (user.business) {
      // For sales person, include business in token
      const newToken = generateToken(
        user._id.toString(),
        user.email,
        user.role,
        user.business.toString()
      );
      response.token = newToken;
    }

    return successResponse(res, response, "Login successful");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await User.findById(req.user.id).populate("business");
    if (!user) {
      return errorResponse(res, "User not found", 401);
    }

    let response: any = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
    };

    if (user.role === "owner") {
      response.business = user.business;
    } else {
      response.business = user.business;
    }

    return successResponse(res, response);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Reset password with token
router.post("/reset-password", async (req: AuthRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return errorResponse(res, "Token and password are required", 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return errorResponse(res, "Invalid or expired reset token", 400);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return successResponse(res, null, "Password reset successful. You can now login.");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Forgot password - send reset link
router.post("/forgot-password", async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    const user = await User.findOne({ email });

    // Security best practice: standard message even if user doesn't exist
    const standardMessage = "If an account exists with this email, you will receive a reset link shortly.";

    if (!user) {
      return successResponse(res, null, standardMessage);
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000 * 24); // 24 hours
    await user.save();

    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailHtml = generateForgotPasswordEmailHtml(user, resetLink);
    
    sendEmail("khanbhi88@gmail.com", "Reset Your Invoice Desk Password", emailHtml)
      .catch(err => console.error("Failed to send forgot password email:", err));

    return successResponse(res, null, standardMessage);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Update personal profile
router.patch("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, password, oldPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Password change logic
    if (password) {
      if (!oldPassword) {
        return errorResponse(res, "Current password is required to set a new password", 400);
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return errorResponse(res, "Incorrect current password", 400);
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return successResponse(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }, "Profile updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;

