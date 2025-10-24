import { Request, Response } from "express";
import Category from "../../models/Category.model";
import SliderModel from "../../models/Slider.model";
import User from "../../models/User.model";
import AdModel from "../../models/Ad.model";

export const getHomePage = async (req: Request, res: Response): Promise<void> => {
  
  try {
    // 1️⃣ Fetch home slider objects (active banners)
    const homeSliderObjects = await SliderModel.find({ isActive: true })
      .sort({ order: 1 }) // optional ordering field
      .limit(8);

    // 2️⃣ Fetch categories (you can choose to show only top/featured categories)
    const categories = await Category.find({ isActive: true })
      .select("name slug image id")
      .sort({ createdAt: -1 })
      .limit(8);

       const recentlyPosted = await AdModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      // .select("storeName rating profilePic");

    // 3️⃣ Fetch top-rated sellers
    const topRatedSellers = await AdModel.find({ isActive: true })
      .sort({ views: -1 })
      .limit(8)

    // 4️⃣ Fetch best sellers (based on sales count or performance)
    const bestSellers = await User.find({ isActive: true })
      .sort({ totalSales: -1 })
      .limit(10)
      .select("storeName totalSales profilePic");

    res.status(200).json({
      message: "Homepage data fetched successfully",
      payload: {
        homeSliderObjects,
        categories,
        recentlyPosted,
        topRatedSellers,
        bestSellers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching homepage data", error });
  }
};