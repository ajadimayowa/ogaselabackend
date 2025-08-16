"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const permission_controller_1 = require("../../controllers/permission/permission.controller");
const router = (0, express_1.Router)();
router.get('/permission/get-permissions', auth_middleware_1.verifyRootAdminToken, permission_controller_1.getPermissions);
exports.default = router;
