import { Router } from 'express';
import { createRole,createSuperAdminRole } from '../controllers/role.controller';
import { verifyToken, isSuperAdmin, isCreator } from '../middleware/auth.middleware';
import { getRolesByDepartment } from '../controllers/role.controller';

const router = Router();
router.post('/role/create-superadmin',isCreator,createSuperAdminRole);
router.post('/role/create',verifyToken,isSuperAdmin, createRole);
router.get('/role/by-department/:departmentId', verifyToken,isSuperAdmin, getRolesByDepartment);


export default router;