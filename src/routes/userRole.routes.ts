import { Router } from 'express';
import { assignRolesToUser, removeRolesFromUser } from '../controllers/userRole.controller'
import { verifyToken, isSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/user-role/assign', verifyToken, isSuperAdmin, assignRolesToUser);
router.post('/user-role/remove', verifyToken, isSuperAdmin, removeRolesFromUser);

export default router;