import { Request, Response } from "express";
import AdModel from "../../models/Ad.model";
import UserModel from "../../models/User.model";
import Category from "../../models/Category.model";

/**
 * @desc Create a new ad
 * @route POST /api/ads
 */
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = (req.files as any)
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
      promotionPlan, // 👈 Added
      paymentReference, // 👈 Added (after Paystack initialization)
    } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !price|| !condition || !seller || !category || !promotionPlan) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    // ✅ Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    // ✅ Verify seller exists
    const user = await UserModel.findById(seller);
    if (!user) {
      res.status(404).json({ success: false, message: "Seller not found" });
      return;
    }

    // ✅ Validate promotion type
    const validPromotionPlans = ["free", "basic", "standard", "premium"];
    if (!promotionPlan || !validPromotionPlans.includes(promotionPlan)) {
      res.status(400).json({ success: false, message: "Invalid or missing promotion type" });
      return;
    }

    // ✅ Set paymentCompleted based on plan type
    const paymentCompleted = promotionPlan === "free" ? true : false;

    // ✅ Create new Ad with promotion details
    const newAd = await AdModel.create({
      title,
      description,
      price,
      images: images.map((gig: any) => gig?.location),
      sellerName,
      reviewCount,
      category,
      subCategory,
      condition,
      location:{
        state:state,
        city:city,
        address:location
      },
      seller,
      promotionType: {
        plan: promotionPlan,
        paymentCompleted,
        paymentReference: paymentReference || null,
      },
    });

    res.status(201).json({
      success: true,
      message: paymentCompleted
        ? "Ad created successfully (Free Plan)"
        : "Ad created successfully. Awaiting payment confirmation.",
      data: newAd,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating ad",
      error: error.message || error,
    });
  }
};

/**
 * @desc Get all ads (with pagination, search, and filters)
 * @route GET /api/ads
 */
export const getAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = "", category, seller } = req.query;

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (seller) {
      query.seller = seller;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const totalAds = await AdModel.countDocuments(query);
    const ads = await AdModel.find(query)
      .populate("category", "name")
      .populate("seller", "profile.fullName profile.profilePicUrl")
      .sort({ createdAt: -1 })
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
      .populate("seller", "profile.fullName profile.profilePicUrl storeName rating totalSales");

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