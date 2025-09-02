import Router from 'express';
import { createBusinessRule, updateBusinessRule } from '../../controllers/super-admin-controllers/businessRuleController.controller';
import { verifyToken } from '../../middleware/auth.middleware';


const router =  Router()

router.post('/rule/create',verifyToken, createBusinessRule)
router.post('/rule/update/:companyId',verifyToken, updateBusinessRule)

export default router;