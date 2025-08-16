import { Router } from "express";
import { verifyRootAdminToken } from "../../middleware/auth.middleware";
import { getPermissions } from "../../controllers/permission/permission.controller";

const router = Router();

router.get('/permission/get-permissions',verifyRootAdminToken, getPermissions);

export default router