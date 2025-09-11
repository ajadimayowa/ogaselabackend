// routes/groupRoutes.ts
import express from "express";
import multer from "multer";
import { createGroup, getGroups, getGroupById, updateGroup, deleteGroup } from "../../controllers/groupLoanControllers/groupLoanController";
import { verifyToken } from "../../middleware/auth.middleware";
import { getMemberById, getMembers, startLoanApplication, updateMember } from "../../controllers/memberController/memberController.controller";
// import upload from "../../middleware/multerMemory";

const storage = multer.memoryStorage();

const upload = multer({ storage});

const router = express.Router();

router.get("/member/:id", verifyToken, getMemberById);
router.put("/member/:memberId", verifyToken, updateMember);
router.put(
    "/member/update/:memberId",
    verifyToken,
     upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "utilityBillPhoto", maxCount: 1 },
    { name: "idCardPhoto", maxCount: 1 },
    { name: "attestationDocumentFile", maxCount: 1 },
  ]),
    updateMember
);

router.post("/group/create", verifyToken, createGroup);
router.get("/groups", verifyToken, getGroups);

router.put("/group/:id", verifyToken, updateGroup);
router.delete("/group/:id", verifyToken, deleteGroup);

export default router;
