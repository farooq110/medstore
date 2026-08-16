import { Router, Response } from "express";
import Business from "../../models/business.model";
import { authenticateToken, requireRole } from "../../Helper/auth.helper";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";

const router = Router();

// Get business details
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user?.business;
    if (!businessId) {
      return errorResponse(res, "Business not found for this user", 404);
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return errorResponse(res, "Business not found", 404);
    }

    return successResponse(res, business);
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Update business details (Owner only)
router.patch("/", authenticateToken, requireRole(["owner"]), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, 
      country, 
      phone, 
      address, 
      website, 
      businessLicense,
      ntn,
      logo
    } = req.body;
    
    const businessId = req.user?.business;
    if (!businessId) {
      return errorResponse(res, "Business not found for this user", 404);
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return errorResponse(res, "Business not found", 404);
    }

    // Authorization is already checked via authenticateToken and requireRole(["owner"])
    // The business belongs to the authenticated user since we got it from req.user?.business

    if (name) business.name = name;
    if (country) business.country = country;
    if (phone) business.phone = phone;
    if (address) business.address = address;
    if (website) business.website = website;
    if (businessLicense) business.businessLicense = businessLicense;
    if (ntn !== undefined) business.ntn = ntn;
    if (logo !== undefined) business.logo = logo;

    await business.save();

    return successResponse(res, business, "Business details updated successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
