import { Request, Response } from "express";
import SliderModel from "../../models/Slider.model";

// ✅ Create a new slider
export const createHomeSlider = async (req: Request, res: Response) : Promise<any> => {
  try {
    const { title, subtitle, image,category, buttonText, buttonLink, isActive, order } = req.body;

    const newSlider = await SliderModel.create({
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      isActive,
      category,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Slider created successfully",
      data: newSlider,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create slider",
    });
  }
};

// ✅ Get all sliders (with optional query filters)
export const getAllHomeSliders = async (req: Request, res: Response):Promise<any> => {
  try {
    const { active } = req.query;
    let query: any = {};

    if (active === "true") query.isActive = true;
    if (active === "false") query.isActive = false;

    const sliders = await SliderModel.find(query).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: "Sliders fetched successfully",
      count: sliders.length,
      payload: sliders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sliders",
    });
  }
};

// ✅ Get a single slider by ID
export const getHomeSliderById = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;

    const slider = await SliderModel.findById(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: slider,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch slider",
    });
  }
};

// ✅ Update a slider
export const updateHomeSlider = async (req: Request, res: Response) :Promise<any>=> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSlider = await SliderModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedSlider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: updatedSlider,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update slider",
    });
  }
};

// ✅ Delete a slider
export const deleteHomeSlider = async (req: Request, res: Response):Promise<any> => {
  try {
    const { id } = req.params;

    const deletedSlider = await SliderModel.findByIdAndDelete(id);

    if (!deletedSlider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete slider",
    });
  }
};

// ✅ Get only active sliders (for homepage)
export const getActiveHomeSliders = async (_req: Request, res: Response):Promise<any> => {
  try {
    const sliders = await SliderModel.find({ isActive: true }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: "Active sliders fetched successfully",
      data: sliders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active sliders",
    });
  }
};