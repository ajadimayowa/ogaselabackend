import express from "express";
import { getHomePage } from "../../controllers/homepage/homePage.controller";

const router = express.Router();

router.get("/home",getHomePage);

export default router;