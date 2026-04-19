import { Router } from "express";
import {
  signup,
  signin,
  refreshToken,
  verifyAccount,
  updateProfile,
} from "../controllers/authController";
import { authorizeRole, requireAuth } from "../middleware/auth";
import { ROLE } from "../config/constant";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refreshToken);
router.post("/verifyAccount", verifyAccount);
router.post(
  "/updateProfile",
  requireAuth,
  authorizeRole([ROLE.ADMIN, ROLE.USER]),
  updateProfile
);

export default router;
