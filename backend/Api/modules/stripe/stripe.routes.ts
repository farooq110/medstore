import { Router, Response, Request } from "express";
import User from "../../models/user.model";
import { successResponse, errorResponse } from "../../Helper/errorHandler";
import { AuthRequest } from "../../Interface/auth.interface";
import { createCheckoutSession, verifyStripeWebhook } from "../../Helper/stripe.helper";
import { StripeEvents, SubscriptionStatus } from "../../constants/stripe.constants";
import { authenticateToken } from "../../Helper/auth.helper";

import Plan from "../../models/plan.model";

const router = Router();

// Get plans based on user's business country
router.get("/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate("business");
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const business = user.business as any;
    if (!business) {
      return errorResponse(res, "Business not found", 404);
    }

    const plans = await Plan.find({ country: business.country, isActive: true });
    return successResponse(res, plans, "Plans retrieved successfully");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});

// Create Checkout Session
router.post("/create-checkout-session", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return errorResponse(res, "Plan ID is required", 400);
    }

    const user = await User.findById(req.user?.id).populate("business");
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    
    const business = user.business as any;
    if (!business) {
      return errorResponse(res, "Business not found", 404);
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return errorResponse(res, "Plan not found", 404);
    }

    if (plan.country !== business.country) {
       return errorResponse(res, "This plan is not available in your region", 400);
    }

    const session = await createCheckoutSession(
      user.stripeCustomerId || "",
      plan.stripePriceId,
      `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.FRONTEND_URL}/plans`
    );

    return successResponse(res, { url: session.url }, "Checkout session created");
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});


// Stripe Webhook handler
// Note: This endpoint expects a raw body for signature verification
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Webhook Error: Missing stripe-signature");
  }

  let event;

  try {
    // req.body should be the raw bytes
    event = verifyStripeWebhook(req.body, sig as string);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case StripeEvents.CHECKOUT_SESSION_COMPLETED: {
        const session = event.data.object as any;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        
        console.log(`Processing ${event.type} for customer: ${customerId}`);

        const result = await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
          },
          { new: true }
        );
        
        console.log("User update result:", result ? "User updated" : "User not found");
        break;
      }

      case StripeEvents.CUSTOMER_SUBSCRIPTION_UPDATED: {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        const status = subscription.status;
        
        console.log(`Processing ${event.type} for customer: ${customerId}, status: ${status}`);

        const result = await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: status,
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          },
          { new: true }
        );
        
        console.log("User update result:", result ? "User updated" : "User not found");
        break;
      }

      case StripeEvents.CUSTOMER_SUBSCRIPTION_DELETED: {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: SubscriptionStatus.CANCELED,
          }
        );
        break;
      }
      
      case StripeEvents.INVOICE_PAYMENT_FAILED: {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;

        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: SubscriptionStatus.PAST_DUE,
          }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook Processing Error: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
});

export default router;