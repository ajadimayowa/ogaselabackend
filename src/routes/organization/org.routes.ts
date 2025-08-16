import { Router } from 'express';
// import {  } from '../controllers/organization';
import { createOrganization, deleteOrganization, getOrganizationById, getOrganizations, onboardStaff, updateOrganization } from '../../controllers/organization/org.controller';
import { verifyToken, isSuperAdmin, isCreator, verifyRootAdminToken } from '../../middleware/auth.middleware';

const router = Router();

router.post('/org/create',verifyRootAdminToken,  createOrganization);
router.put('/org/organization/:orgId',isCreator, updateOrganization);
router.get('/root/organizations',verifyRootAdminToken, getOrganizations);
router.get('/org/organization/:orgId',isCreator, getOrganizationById);
router.delete('/org/organization/:orgId',isCreator, deleteOrganization);

router.post('/org/staff', verifyToken, isSuperAdmin, onboardStaff);

export default router;