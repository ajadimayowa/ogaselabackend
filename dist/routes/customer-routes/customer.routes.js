"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/groupRoutes.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const groupLoanController_1 = require("../../controllers/groupLoanControllers/groupLoanController");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const memberController_controller_1 = require("../../controllers/memberController/memberController.controller");
// import upload from "../../middleware/multerMemory";
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const router = express_1.default.Router();
router.get("/member/:id", auth_middleware_1.verifyToken, memberController_controller_1.getMemberById);
router.put("/member/:memberId", auth_middleware_1.verifyToken, memberController_controller_1.updateMember);
router.put("/member/update/:memberId", auth_middleware_1.verifyToken, upload.fields([
    { name: "passportPhoto", maxCount: 1 },
    { name: "utilityBillPhoto", maxCount: 1 },
    { name: "idCardPhoto", maxCount: 1 },
    { name: "attestationDocumentFile", maxCount: 1 },
]), memberController_controller_1.updateMember);
router.post("/group/create", auth_middleware_1.verifyToken, groupLoanController_1.createGroup);
router.get("/groups", auth_middleware_1.verifyToken, groupLoanController_1.getGroups);
router.put("/group/:id", auth_middleware_1.verifyToken, groupLoanController_1.updateGroup);
router.delete("/group/:id", auth_middleware_1.verifyToken, groupLoanController_1.deleteGroup);
exports.default = router;
