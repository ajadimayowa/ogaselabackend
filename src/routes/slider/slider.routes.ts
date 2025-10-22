import express from "express";
import { 
    createHomeSlider,
    getAllHomeSliders,
  getHomeSliderById,
  updateHomeSlider,
  deleteHomeSlider,
  getActiveHomeSliders,

 } from "../../controllers/homeSlider/homeSlider.controller";
import { isCreator } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/slide",isCreator, createHomeSlider);
router.get("/sliders",isCreator, getAllHomeSliders);
router.get("/active",isCreator, getActiveHomeSliders);
router.get("/slider/:id",isCreator, getHomeSliderById);
router.put("/slider/:id", updateHomeSlider);
router.delete("/slider/:id",isCreator, deleteHomeSlider);

export default router;