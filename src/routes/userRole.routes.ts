import { Router } from 'express';
import { assignRolesToUser, removeRolesFromUser } from '../controllers/userRole.controller'
import { verifyToken, isSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/assign', verifyToken, isSuperAdmin, assignRolesToUser);
router.post('/remove', verifyToken, isSuperAdmin, removeRolesFromUser);

export default router;