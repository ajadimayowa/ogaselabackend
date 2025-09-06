// routes/groupRoutes.ts
import express from "express";
import { createGroup, getGroups, getGroupById, updateGroup, deleteGroup } from "../../controllers/groupLoanControllers/groupLoanController";
import { verifyToken } from "../../middleware/auth.middleware";
import { getMemberById, getMembers, updateMember } from "../../controllers/memberController/memberController.controller";

const router = express.Router();

router.get("/member/:id",verifyToken, getMemberById);
router.put("/member/:memberId",verifyToken, updateMember);

router.post("/group/create",verifyToken, createGroup);
router.get("/groups",verifyToken, getGroups);

router.put("/group/:id",verifyToken, updateGroup);
router.delete("/group/:id",verifyToken, deleteGroup);

export default router;
