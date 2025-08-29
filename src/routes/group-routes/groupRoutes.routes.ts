// routes/groupRoutes.ts
import express from "express";
import { createGroup, getGroups, getGroupById, updateGroup, deleteGroup } from "../../controllers/groupLoanControllers/groupLoanController";
import { verifyToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/group/create",verifyToken, createGroup);
router.get("/groups",verifyToken, getGroups);
router.get("/:id",verifyToken, getGroupById);
router.put("/:id",verifyToken, updateGroup);
router.delete("/:id",verifyToken, deleteGroup);

export default router;
