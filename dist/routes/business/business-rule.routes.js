"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const businessRuleController_controller_1 = require("../../controllers/super-admin-controllers/businessRuleController.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.default)();
router.post('/rule/create', auth_middleware_1.verifyToken, businessRuleController_controller_1.createBusinessRule);
router.post('/rule/update/:companyId', auth_middleware_1.verifyToken, businessRuleController_controller_1.updateBusinessRule);
exports.default = router;
