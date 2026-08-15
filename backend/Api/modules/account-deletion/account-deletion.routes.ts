import { Router, Response } from "express";
import crypto from "crypto";
import AccountDeletionRequest from "../../models/account-deletion-request.model";
import User from "../../models/user.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { sendEmail } from "../../Helper/mail.helper";

const router = Router();

// Submit account deletion request
router.post(
  "/request",
  async (req: AuthRequest, res: Response) => {
    try {
      const { email, phoneNumber } = req.body;

      // Validate input
      if (!email || !phoneNumber) {
        return errorResponse(res, "Email and phone number are required", 400);
      }

      // Check if user exists with this email and phone
      const user = await User.findOne({
        email: email.toLowerCase().trim(),
        phone: phoneNumber.trim(),
      });

      if (!user) {
        // For security, don't reveal if user exists or not
        return successResponse(
          res,
          { message: "If a matching account is found, you will receive a verification email" },
          "Deletion request submitted",
          200
        );
      }

      // Check if there's already a pending request
      const existingRequest = await AccountDeletionRequest.findOne({
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber.trim(),
        status: { $in: ["pending", "verified", "processing"] },
      });

      if (existingRequest) {
        return errorResponse(
          res,
          "You already have a pending account deletion request. Please wait for it to be processed.",
          400
        );
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

      // Create deletion request
      const deletionRequest = new AccountDeletionRequest({
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber.trim(),
        status: "pending",
        verificationToken,
        verificationExpires,
      });

      await deletionRequest.save();

      // Send verification email
      const verificationLink = `${process.env.WEBAPP_URL || "https://invoice.hyperdevsolutions.com"}/verify-account-deletion/${deletionRequest._id}/${verificationToken}`;

      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c3e50;">Account Deletion Request Verification</h2>
              
              <p>Hello,</p>
              
              <p>We received a request to delete your InvoiceDesk account associated with this email address.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Important Information:</strong></p>
                <ul style="margin: 10px 0;">
                  <li>This action is <strong>permanent</strong> and cannot be undone</li>
                  <li>All your data will be deleted within 30 days</li>
                  <li>Your orders, clients, and inventory records will be permanently removed</li>
                  <li>Some financial records may be retained for compliance purposes</li>
                </ul>
              </div>
              
              <p><strong>To confirm your account deletion request, click the button below:</strong></p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Verify and Confirm Deletion
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px;">Or copy and paste this link in your browser:</p>
              <p style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">
                ${verificationLink}
              </p>
              
              <p style="color: #999; font-size: 12px;">This verification link will expire in 24 hours.</p>
              
              <p><strong>If you did not request this, please ignore this email or contact us immediately.</strong></p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <div style="color: #999; font-size: 12px;">
                <p><strong>InvoiceDesk - Hyperdev Solutions</strong></p>
                <p>Email: hyperdevsolutions@gmail.com</p>
                <p>Website: https://invoice.hyperdevsolutions.com</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail(
        user.email,
        "Account Deletion Request Verification",
        emailHtml
      );

      return successResponse(
        res,
        { message: "If a matching account is found, you will receive a verification email" },
        "Deletion request submitted",
        200
      );
    } catch (error: any) {
      console.error("Error submitting deletion request:", error);
      return errorResponse(res, error.message, 500);
    }
  }
);

// Verify and confirm account deletion
router.post(
  "/verify/:id/:token",
  async (req: AuthRequest, res: Response) => {
    try {
      const { id, token } = req.params;

      // Find deletion request
      const deletionRequest = await AccountDeletionRequest.findById(id);

      if (!deletionRequest) {
        return errorResponse(res, "Invalid or expired verification link", 400);
      }

      // Check if token matches and not expired
      if (
        deletionRequest.verificationToken !== token ||
        !deletionRequest.verificationExpires ||
        deletionRequest.verificationExpires < new Date()
      ) {
        return errorResponse(res, "Verification link has expired or is invalid", 400);
      }

      // Update request status
      deletionRequest.status = "verified";
      deletionRequest.verifiedAt = new Date();
      deletionRequest.verificationToken = undefined;
      deletionRequest.verificationExpires = undefined;
      await deletionRequest.save();

      // Find and delete the user account
      const user = await User.findOne({
        email: deletionRequest.email,
        phone: deletionRequest.phoneNumber,
      });

      if (user) {
        // Send confirmation email before deletion
        const confirmationEmailHtml = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #27ae60;">Account Deletion - Processing Started</h2>
                
                <p>Hello ${user.name},</p>
                
                <p>Your account deletion request has been verified and is now being processed.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>What will happen next:</strong></p>
                  <ul style="margin: 10px 0;">
                    <li>Your account will be marked for deletion</li>
                    <li>All your data will be permanently removed within 30 days</li>
                    <li>You will receive a confirmation email when deletion is complete</li>
                    <li>You will not be able to access your account during this period</li>
                  </ul>
                </div>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                  <strong>InvoiceDesk - Hyperdev Solutions</strong><br>
                  Email: hyperdevsolutions@gmail.com<br>
                  Website: https://invoice.hyperdevsolutions.com
                </p>
              </div>
            </body>
          </html>
        `;

        await sendEmail(
          user.email,
          "Account Deletion - Processing Started",
          confirmationEmailHtml
        );

        // Delete user and related data
        await User.deleteOne({ _id: user._id });
      }

      // Update deletion request status to completed
      deletionRequest.status = "completed";
      deletionRequest.processedAt = new Date();
      await deletionRequest.save();

      return successResponse(
        res,
        { message: "Account deletion completed successfully" },
        "Account deleted",
        200
      );
    } catch (error: any) {
      console.error("Error verifying deletion request:", error);
      return errorResponse(res, error.message, 500);
    }
  }
);

// Get all deletion requests (Admin only - for internal tracking)
router.get(
  "/admin/requests",
  async (req: AuthRequest, res: Response) => {
    try {
      // This endpoint should be protected by admin middleware in production
      const { status, page = 1, limit = 20 } = req.query;

      const numericPage = Math.max(1, parseInt(page as string) || 1);
      const numericLimit = Math.max(1, parseInt(limit as string) || 10);
      const skip = (numericPage - 1) * numericLimit;

      const query: any = {};
      if (status) {
        query.status = status;
      }

      const total = await AccountDeletionRequest.countDocuments(query);
      const pages = Math.ceil(total / numericLimit);

      const requests = await AccountDeletionRequest.find(query)
        .select("-verificationToken")
        .skip(skip)
        .limit(numericLimit)
        .sort({ createdAt: -1 });

      return successResponse(
        res,
        {
          requests,
          pagination: {
            page: numericPage,
            limit: numericLimit,
            totalCount: total,
            hasMore: numericPage < pages,
            pages,
          },
        },
        "Deletion requests fetched",
        200
      );
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
);

export default router;
