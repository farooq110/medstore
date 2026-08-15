import { Router } from "express";
import authRoutes from "../Api/modules/authentication/authentication.routes";
import orderPublicRoutes from "../Api/modules/order/order.public.routes";
import accountDeletionRoutes from "../Api/modules/account-deletion/account-deletion.routes";
import configRoutes from "../Api/modules/config/config.routes";
// import stripeRoutes from "../Api/modules/stripe/stripe.routes";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.use("/public/orders", orderPublicRoutes);
router.use("/account-deletion", accountDeletionRoutes);
router.use("/config", configRoutes);
// router.use("/stripe", stripeRoutes);

export default router;
