import { Router } from "express";
import { authorizeRole, requireAuth } from "../middleware/auth";
import {
  createQuestion,
  getQuestionsByTopicId,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController";
import { ROLE } from "../config/constant";

const router = Router();

router.post("/", requireAuth, authorizeRole([ROLE.ADMIN]), createQuestion);
router.get("/:topicId", requireAuth, authorizeRole([ROLE.ADMIN, ROLE.USER]), getQuestionsByTopicId);
router.put("/:questionId", requireAuth, authorizeRole([ROLE.ADMIN]), updateQuestion);
router.delete("/:questionId", requireAuth, authorizeRole([ROLE.ADMIN]), deleteQuestion);

export default router;
