import express from 'express';
import * as departmentController from '../controllers/department.controller';
import { isCreator, verifyRootAdminToken, verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/department/create-admin',verifyRootAdminToken, departmentController.createDepartment);
router.get('/root/departments',verifyRootAdminToken,departmentController.getDepartments);

router.post('/department/create',verifyToken, departmentController.createDepartment);
router.get('/departments',verifyToken,departmentController.getDepartments);


router.get('/departments',verifyRootAdminToken,departmentController.getDepartments);
router.get('/department/',isCreator, departmentController.getAllDepartments);
router.get('/department/:id',isCreator, departmentController.getDepartmentById);
router.put('/department/:id',isCreator, departmentController.updateDepartment);
router.delete('/department/:id',isCreator, departmentController.deleteDepartment);

export default router;