import { Request, Response } from "express";
import AdModel from "../../../models/Ad.model";
export const activateAd = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const ad = await AdModel.findById(id);
        if (!ad) {
            return res.status(404).json({ success: false, message: "Ad not found" });
        }

        // Check both conditions
        if (ad.adminReviewed) {
            return res.status(400).json({ success: false, message: "Admin already reviewed!" });
        }

        if (!ad.promotionType.paymentCompleted) {
            return res.status(400).json({
                success: false,
                message: "Payment not completed",
            });
        }

        const duration = ad.promotionType.durationInDays || 0;

        // Activate the ad now
        const now = new Date();
        ad.isActive = true;
        ad.promotionType.startDate = now;
        ad.promotionType.endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

        await ad.save();

        res.json({
            success: true,
            message: "Ad activated successfully",
            data: ad,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
