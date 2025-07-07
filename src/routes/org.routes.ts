import { Router } from 'express';
import { createOrganization, deleteOrganization, getOrganizationById, onboardStaff, updateOrganization } from '../controllers/org.controller';
import { verifyToken, isSuperAdmin, isCreator } from '../middleware/auth.middleware';

const router = Router();

router.post('/create',isCreator,  createOrganization);
router.put('/organization/:orgId', updateOrganization);
router.get('/organization/:orgId', getOrganizationById);
router.delete('/organization/:orgId', deleteOrganization);

router.post('/staff', verifyToken, isSuperAdmin, onboardStaff);

export default router;