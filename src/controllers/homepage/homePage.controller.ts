import { Request, Response } from "express";
import Category from "../../models/Category.model";
import SliderModel from "../../models/Slider.model";
import User from "../../models/User.model";
import AdModel from "../../models/Ad.model";
import { getUserAddressGoogle } from "../../utils/useConvertUserCordintates";

// Helper function to fetch homepage data
const fetchHomepageData = async (state:any) => {
  console.log({sortingBy:state})
  const homeSliderObjects = await SliderModel.find({ isActive: true })
    .sort({ order: 1 })
    .limit(8);

  const categories = await Category.find({ isActive: true })
    .select("name slug image id")
    .sort({ createdAt: -1 })
    .limit(8);

  const recentlyPosted = await AdModel.find({ 'location.state':state })
    .sort({ createdAt: -1 })
    .limit(8);

  const topRatedSellers = await AdModel.find({ 'location.state':state })
    .sort({ views: -1 })
    .limit(8);

  const bestSellers = await User.find({ 'location.state':state })
    .sort({ totalSales: -1 })
    .limit(10)
    .select("storeName totalSales profilePic");

  return { homeSliderObjects, categories, recentlyPosted, topRatedSellers, bestSellers };
};

const fetchHomepageDataNoState = async () => {
  const homeSliderObjects = await SliderModel.find({ isActive: true })
    .sort({ order: 1 })
    .limit(8);

  const categories = await Category.find({ isActive: true })
    .select("name slug image id")
    .sort({ createdAt: -1 })
    .limit(8);

  const recentlyPosted = await AdModel.find({ isActive: true})
    .sort({ createdAt: -1 })
    .limit(8);

  const topRatedSellers = await AdModel.find({ isActive: true })
    .sort({ views: -1 })
    .limit(8);

  const bestSellers = await User.find({ isActive: true})
    .sort({ totalSales: -1 })
    .limit(10)
    .select("storeName totalSales profilePic");

  return { homeSliderObjects, categories, recentlyPosted, topRatedSellers, bestSellers };
};

export const getHomePage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { lat, lon } = req.query;
     console.log('seecord',lat,lon);

    let state: string | null = null;

    if (lat && lon && typeof lat === "string" && typeof lon === "string") {
      // Reverse geocode using Google API
      state = await getUserAddressGoogle(lat, lon);
      console.log({ seeState: state });
      const payload = await fetchHomepageData(`${state} State`);

    return res.status(200).json({
      message: "Homepage data fetched successfully",
      state, // optional: include user's state if available
      payload,
    });
    } else {
      const payload = await fetchHomepageDataNoState();

    return res.status(200).json({
      message: "Homepage data fetched successfully",
      state, // optional: include user's state if available
      payload,
    });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching homepage data",
      error,
    });
  }
};