import axios from "axios";
import { Request, Response } from "express";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET!;

// Define allowed promotion plans
type PromotionPlan = "free" | "basic" | "standard" | "premium";

// Define price list with explicit typing
const promotionPrices: Record<PromotionPlan, number> = {
  free: 0,
  basic: 2000,
  standard: 7000,
  premium: 30000,
};

export const initiateAdPayment = async (req: Request, res: Response):Promise<any> => {
  try {
    const { email, promotionPlan } = req.body as {
      email: string;
      promotionPlan: PromotionPlan;
    };

    // Validate promotion type
    if (!promotionPlan || !(promotionPlan in promotionPrices)) {
      return res.status(400).json({ message: "Invalid promotion plan" });
    }

    const amount = promotionPrices[promotionPlan];

    // If plan is free, skip Paystack
    if (promotionPlan === "free") {
      return res.status(200).json({
        message: "Free plan selected, no payment required",
        paymentRequired: false,
      });
    }

    // Initialize Paystack payment
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        metadata: { promotionPlan },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    return res.status(200).json({
      message: "Payment initialized successfully",
      paymentRequired: true,
      authorizationUrl: authorization_url,
      reference,
    });
  } catch (error: any) {
    console.error("Paystack Init Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Error initializing payment",
      error: error.response?.data || error.message,
    });
  }
};