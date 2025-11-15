"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_controller_1 = require("../../controllers/user/user.controller");
const upload_1 = __importDefault(require("../../middleware/upload"));
const router = (0, express_1.Router)();
router.get('/user/:id', auth_middleware_1.verifyUserToken, user_controller_1.getUserById);
router.put("/user/update-businessinfo/:userId", auth_middleware_1.verifyUserToken, user_controller_1.updateBusinessInfo);
router.put("/user/kyc/:userId", auth_middleware_1.verifyUserToken, user_controller_1.doKyc);
router.put("/user/profile/:userId", auth_middleware_1.verifyUserToken, upload_1.default.single("profilePicUrl"), user_controller_1.updateProfile);
exports.default = router;
