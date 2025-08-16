import { Router } from 'express';
import { createRole,createSuperAdminRole, getRolesController } from '../controllers/role.controller';
import { verifyToken, isSuperAdmin, isCreator, verifyRootAdminToken } from '../middleware/auth.middleware';
import { getRolesByDepartment } from '../controllers/role.controller';

const router = Router();
router.post('/role/create-superadmin',verifyRootAdminToken,createSuperAdminRole);
router.get('/root/roles', verifyRootAdminToken,getRolesController);

router.post('/role/create',verifyToken,createRole);
router.get('/roles',verifyToken,getRolesController);

router.get('/role/roles', verifyToken,getRolesByDepartment);
router.get('/role/by-department/:departmentId', verifyToken,getRolesByDepartment);


export default router;