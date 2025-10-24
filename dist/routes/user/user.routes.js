"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const user_controller_1 = require("../../controllers/user/user.controller");
const router = (0, express_1.Router)();
router.get('/user/:id', auth_middleware_1.verifyUserToken, user_controller_1.getUserById);
exports.default = router;
