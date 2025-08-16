"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creator_controller_1 = require("../../controllers/creator-controllers/creator.controller");
const router = (0, express_1.Router)();
router.post('/creator/create', creator_controller_1.registerCreatorController);
router.post('/creator/login', creator_controller_1.creatorLoginController);
exports.default = router;
