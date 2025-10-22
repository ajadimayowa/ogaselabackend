"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const homeSlider_controller_1 = require("../../controllers/homeSlider/homeSlider.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/slide", auth_middleware_1.isCreator, homeSlider_controller_1.createHomeSlider);
router.get("/sliders", auth_middleware_1.isCreator, homeSlider_controller_1.getAllHomeSliders);
router.get("/active", auth_middleware_1.isCreator, homeSlider_controller_1.getActiveHomeSliders);
router.get("/slider/:id", auth_middleware_1.isCreator, homeSlider_controller_1.getHomeSliderById);
router.put("/slider/:id", homeSlider_controller_1.updateHomeSlider);
router.delete("/slider/:id", auth_middleware_1.isCreator, homeSlider_controller_1.deleteHomeSlider);
exports.default = router;
