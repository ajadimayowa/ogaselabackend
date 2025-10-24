import { Router } from 'express';
// import { register, login } from '../controllers/auth.controller';
import { createStaff, getStaffProfileByStaffId, getStaffs, registerSuperAdmin } from '../../controllers/staff/staff-controllers';
import { isCreator, isSuperAdmin, verifyRootAdminToken, verifyToken, verifyUserToken } from '../../middleware/auth.middleware';
import { loginStaff,requestPasswordResetOtp,resetStaffPasswordWithOtp,verifyLoginOtp} from '../../controllers/auth/staff';
import { getUserById } from '../../controllers/user/user.controller';

const router = Router();
router.get('/user/:id',verifyUserToken,getUserById);

export default router;
