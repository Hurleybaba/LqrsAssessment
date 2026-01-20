import { Router } from "express";
import userRoutes from "./modules/user/user.route.js";
import walletRoutes from "./modules/wallet/wallet.route.js";
const router = Router();

router.use("/api/users", userRoutes);
router.use("/api/wallet", walletRoutes);

export default router;
