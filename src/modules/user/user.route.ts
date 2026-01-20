import { Router } from "express";
import { register, me } from "./user.controller.js";
import { fauxAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", register);
router.get("/me", fauxAuth, me);

export default router;
