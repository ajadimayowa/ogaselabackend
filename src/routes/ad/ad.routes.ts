import { Router } from "express";
import express from "express";

import {
    createAd,
    getAds,
    getAdById,
    updateAd,
    deleteAd,
    updatePromotionPayment,

} from "../../controllers/ad/ad.controller";
import { verifyUserToken } from "../../middleware/auth.middleware";
import { initiateAdPayment } from "../../controllers/ad/initiatePayment.controller";
import{ uploadAdImages } from "../../middleware/upload";

const router = Router();

// POST - Create new ad
router.post("/ad", verifyUserToken,uploadAdImages.array("images", 3), createAd);

// GET - All ads
router.get("/ads", getAds);

// GET - Single ad by ID
router.get("/ad/:id", getAdById);


// PUT - Update ad
router.put("/:id",verifyUserToken, updateAd);

// DELETE - Remove ad
router.delete("/:id",verifyUserToken, deleteAd);

router.post("/ad/update-payment",verifyUserToken, updatePromotionPayment);

router.post("/initiate-payment", initiateAdPayment);
// router.post("/paystack/webhook", paystackWebhook);

export default router;