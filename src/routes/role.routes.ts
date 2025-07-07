import { Router } from 'express';
import { createRole,createSuperAdminRole } from '../controllers/role.controller';
import { verifyToken, isSuperAdmin } from '../middleware/auth.middleware';
import { getRolesByDepartment } from '../controllers/role.controller';

const router = Router();
router.post('/create-superadmin',createSuperAdminRole);
router.post('/create',createRole);
router.get('/by-department/:departmentId', verifyToken, getRolesByDepartment);


export default router;