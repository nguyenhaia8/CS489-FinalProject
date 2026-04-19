import { Router } from "express";
import { authorizeRole, requireAuth } from "../middleware/auth";
import {
  createTopic,
  deleteTopic,
  getAllTopic,
  updateTopic,
} from "../controllers/topicController";
import { ROLE } from "../config/constant";

const router = Router();

router.post("/", requireAuth, authorizeRole([ROLE.ADMIN]), createTopic);
router.get("/", requireAuth, authorizeRole([ROLE.ADMIN, ROLE.USER]), getAllTopic);
router.put("/:topic_id", requireAuth, authorizeRole([ROLE.ADMIN]), updateTopic);
router.delete("/:topic_id", requireAuth, authorizeRole([ROLE.ADMIN]), deleteTopic);

export default router;
