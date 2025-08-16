import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import {registerCreatorController,creatorLoginController} from "../../controllers/creator-controllers/creator.controller";
const router = Router();

router.post('/creator/create', registerCreatorController);
router.post('/creator/login', creatorLoginController);

export default router;