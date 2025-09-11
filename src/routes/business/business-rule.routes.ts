import Router from 'express';
import { createBusinessRule, getBusinessRule, getBusinessRuleProducts, updateBusinessRule } from '../../controllers/super-admin-controllers/businessRuleController.controller';
import { verifyToken } from '../../middleware/auth.middleware';


const router =  Router()

router.post('/rule/create',verifyToken, createBusinessRule)
router.get('/rule/:companyId',verifyToken, getBusinessRule);
router.get('/rule/products/:companyId',verifyToken, getBusinessRuleProducts)
router.post('/rule/update/:companyId',verifyToken, updateBusinessRule)

export default router;