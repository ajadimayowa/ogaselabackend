"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRole_controller_1 = require("../controllers/userRole.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/user-role/assign', auth_middleware_1.verifyToken, auth_middleware_1.isSuperAdmin, userRole_controller_1.assignRolesToUser);
router.post('/user-role/remove', auth_middleware_1.verifyToken, auth_middleware_1.isSuperAdmin, userRole_controller_1.removeRolesFromUser);
exports.default = router;
