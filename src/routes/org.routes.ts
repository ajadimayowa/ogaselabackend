import { Router } from 'express';
import { createOrganization, deleteOrganization, getOrganizationById, onboardStaff, updateOrganization } from '../controllers/org.controller';
import { verifyToken, isSuperAdmin, isCreator } from '../middleware/auth.middleware';

const router = Router();

router.post('/org/create',isCreator,  createOrganization);
router.put('/org/organization/:orgId',isCreator, updateOrganization);
router.get('/org/organization/:orgId',isCreator, getOrganizationById);
router.delete('/org/organization/:orgId',isCreator, deleteOrganization);

router.post('/org/staff', verifyToken, isSuperAdmin, onboardStaff);

export default router;