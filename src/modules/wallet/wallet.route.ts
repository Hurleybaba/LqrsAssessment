import { Router } from "express";
import { fund, transfer, withdraw, history, getBalance } from "./wallet.controller.js";
import { fauxAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

// All wallet routes should be protected
router.use(fauxAuth);

router.get("/balance", getBalance);
router.post("/fund", fund);
router.post("/transfer", transfer);
router.post("/withdraw", withdraw);
router.get("/history", history);

export default router;