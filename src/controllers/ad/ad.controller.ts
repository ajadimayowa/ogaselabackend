import { Request, Response } from "express";
import AdModel from "../../models/Ad.model";
import UserModel from "../../models/User.model";
import Category from "../../models/Category.model";
import axios from "axios";

/**
 * @desc Create a new ad
 * @route POST /api/ads
 */
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = (req.files as any);

    const {
      title,
      description,
      price,
      sellerName,
      reviewCount,
      category,
      subCategory,
      condition,
      state,
      city,
      location,
      seller,
      promotionPlan,
      paymentReference,
    } = req.body;

    if (!title || !description || !price || !condition || !seller || !category || !promotionPlan) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const validPromotionPlans = ["free", "basic", "standard", "premium"];
    if (!validPromotionPlans.includes(promotionPlan)) {
      res.status(400).json({ success: false, message: "Invalid promotion plan" });
      return;
    }

    // Payment logic
    const paymentCompleted = promotionPlan === "free";

    const newAd = await AdModel.create({
      title,
      description,
      price,
      images: images.map((img: any) => img?.location),
      sellerName,
      reviewCount,
      category,
      subCategory,
      condition,
      location: {
        state,
        city,
        address: location,
      },
      seller,

      // 🚨 Ads are inactive until admin + payment
      isActive: false,
      adminReviewed: false,

      promotionType: {
        plan: promotionPlan,
        paymentCompleted,
        paymentReference: paymentReference || null,
        startDate: null,
        endDate: null,
      },
    });

    res.status(201).json({
      success: true,
      message:
        paymentCompleted
          ? "Ad created successfully. Awaiting admin review."
          : "Ad created successfully. Awaiting payment & admin review.",
      data: newAd,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating ad",
      error: error.message,
    });
  }
};

/**
 * @desc Get all ads (with pagination, search, and filters)
 * @route GET /api/ads
 */
export const getAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      seller,
      sortBy = "createdAt",
      order = "desc",
      isActive,
      isPaymentCompleted, // 👈 NEW
    } = req.query;

    const query: any = {};

    // ⭐ DEFAULT BEHAVIOUR → Only active ads
    if (isActive === "true") query.isActive = true;
    else if (isActive === "false") query.isActive = false;
    else query.isActive = true; // default

    // ⭐ Filter by Payment Completed
    if (isPaymentCompleted === "true") {
      query["promotionType.paymentCompleted"] = true;
    } else if (isPaymentCompleted === "false") {
      query["promotionType.paymentCompleted"] = false;
    }

    // 🔍 Search by title or seller name
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "seller.profile.fullName": { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (seller) query.seller = seller;

    const skip = (Number(page) - 1) * Number(limit);

    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy === "price") sortOptions.price = order === "asc" ? 1 : -1;
    else if (sortBy === "city") sortOptions["location.city"] = order === "asc" ? 1 : -1;
    else sortOptions.createdAt = order === "asc" ? 1 : -1;

    // 🧮 Total count
    const totalAds = await AdModel.countDocuments(query);

    // 🧾 Fetch ads
    const ads = await AdModel.find(query)
      .populate("category", "name")
      .populate("seller", "profile.fullName profile.profilePicUrl")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: "Ads fetched successfully",
      pagination: {
        total: totalAds,
        currentPage: Number(page),
        totalPages: Math.ceil(totalAds / Number(limit)),
      },
      data: ads,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching ads", error });
  }
};

/**
 * @desc Get a single ad by ID
 * @route GET /api/ads/:id
 */
export const getAdById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ad = await AdModel.findById(id)
      .populate("category", "name")
      .populate("seller", "profile.fullName profile.profilePicUrl storeName rating totalSales contact.phoneNumber");

    if (!ad) {
      res.status(404).json({ success: false, message: "Ad not found" });
      return;
    }

    // Increment view count
    ad.views += 1;
    await ad.save();

    res.status(200).json({
      success: true,
      message: "Ad fetched successfully",
      data: ad,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching ad", error });
  }
};

/**
 * @desc Update ad details
 * @route PUT /api/ads/:id
 */
export const updateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedAd = await AdModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedAd) {
      res.status(404).json({ success: false, message: "Ad not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ad updated successfully",
      data: updatedAd,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating ad", error });
  }
};

/**
 * @desc Delete an ad
 * @route DELETE /api/ads/:id
 */
export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ad = await AdModel.findByIdAndDelete(id);
    if (!ad) {
      res.status(404).json({ success: false, message: "Ad not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting ad", error });
  }
};

export const updatePromotionPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { adId, reference } = req.body;

    if (!adId || !reference) {
      return res.status(400).json({
        message: "adId and reference are required",
      });
    }

    const ad = await AdModel.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // 🔍 1. VERIFY PAYMENT WITH PAYSTACK
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    const verification = paystackRes.data;

    if (!verification.status || verification.data.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment not verified",
        paystackResponse: verification,
      });
    }

    // Optional validation: Ensure amount matches expected price
    const paidAmount = verification.data.amount / 100; // Paystack stores in kobo
    const expectedAmount = ad.promotionType.price;

    if (paidAmount < expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Incorrect amount paid. Payment rejected.",
        expectedAmount,
        paidAmount,
      });
    }

    // 🔐 2. SAVE payment as verified
    ad.promotionType.paymentCompleted = true;
    ad.promotionType.paymentReference = reference;

    await ad.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Awaiting admin review.",
      payload: ad,
    });

  } catch (error: any) {
    console.error("PAYMENT VERIFY ERROR:", error.response?.data || error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.response?.data || error.message,
    });
  }
};