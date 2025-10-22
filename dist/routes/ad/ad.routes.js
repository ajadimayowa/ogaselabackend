"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ad_controller_1 = require("../../controllers/ad/ad.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const initiatePayment_controller_1 = require("../../controllers/ad/initiatePayment.controller");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
// POST - Create new ad
router.post("/ad", auth_middleware_1.verifyUserToken, upload_1.uploadAdImages.array("images", 3), ad_controller_1.createAd);
// GET - All ads
router.get("/ads", ad_controller_1.getAds);
// GET - Single ad by ID
router.get("/ad/:id", ad_controller_1.getAdById);
// PUT - Update ad
router.put("/:id", ad_controller_1.updateAd);
// DELETE - Remove ad
router.delete("/:id", ad_controller_1.deleteAd);
router.post("/initiate-payment", initiatePayment_controller_1.initiateAdPayment);
// router.post("/paystack/webhook", paystackWebhook);
exports.default = router;
