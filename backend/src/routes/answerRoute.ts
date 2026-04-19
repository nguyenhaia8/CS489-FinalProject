import { Router } from "express";
import { authorizeRole, requireAuth } from "../middleware/auth";
import { generateAnswer, getHistoryAnswer } from "../controllers/answerController";
import { ROLE } from "../config/constant";

const router = Router();

router.post("/", requireAuth, authorizeRole([ROLE.ADMIN, ROLE.USER]), generateAnswer);
router.get("/history", requireAuth, authorizeRole([ROLE.ADMIN, ROLE.USER]), getHistoryAnswer);

export default router;
