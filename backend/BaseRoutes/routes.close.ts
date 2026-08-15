import { Router } from "express";
import { authenticateToken, requireRole } from "../Api/Helper/auth.helper";
import userRoutes from "../Api/modules/user/user.routes";
import clientRoutes from "../Api/modules/client/client.routes";
import categoryRoutes from "../Api/modules/category/category.routes";
import itemRoutes from "../Api/modules/item/item.routes";
import orderRoutes from "../Api/modules/order/order.routes";
import alertRoutes from "../Api/modules/alert/alert.routes";
import reportRoutes from "../Api/modules/report/report.routes";
import dashboardRoutes from "../Api/modules/dashboard/dashboard.routes";
import businessRoutes from "../Api/modules/business/business.routes";
import configRoutes from "../Api/modules/config/config.routes";

const router = Router();

// Apply authentication to all protected routes
router.use(authenticateToken);

// Protected routes
router.use("/users", userRoutes);
router.use("/clients", clientRoutes);
router.use("/categories", categoryRoutes);
router.use("/items", itemRoutes);
router.use("/orders", orderRoutes);
router.use("/alerts", alertRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/business", businessRoutes);
router.use("/config", configRoutes);

export default router;
