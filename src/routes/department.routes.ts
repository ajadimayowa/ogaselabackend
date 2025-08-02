import express from 'express';
import * as departmentController from '../controllers/department.controller';
import { isCreator, verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/department/create-admin',isCreator, departmentController.createAdminDepartment);
router.post('/department/create',verifyToken, departmentController.createDepartment);
router.get('/department/by-organization/:organizationId',departmentController.getDepartmentsByOrganizationId);
router.get('/department/',isCreator, departmentController.getAllDepartments);
router.get('/department/:id',isCreator, departmentController.getDepartmentById);
router.put('/department/:id',isCreator, departmentController.updateDepartment);
router.delete('/department/:id',isCreator, departmentController.deleteDepartment);

export default router;