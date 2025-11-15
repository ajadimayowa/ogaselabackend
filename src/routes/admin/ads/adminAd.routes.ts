import { Router } from 'express';
// import { register, login } from '../controllers/auth.controller';
import { createStaff, getStaffProfileByStaffId, getStaffs, registerSuperAdmin } from '../../../controllers/staff/staff-controllers';
import { isCreator, isSuperAdmin, verifyIsAdmin, verifyRootAdminToken, verifyToken, verifyUserToken } from '../../../middleware/auth.middleware';
import { loginStaff,requestPasswordResetOtp,resetStaffPasswordWithOtp,verifyLoginOtp} from '../../../controllers/auth/staff';
import { doKyc, getUserById, updateBusinessInfo, updateProfile } from '../../../controllers/user/user.controller';
import upload from '../../../middleware/multerMemory';
import uploadAdImages from '../../../middleware/upload';
import { activateAd } from '../../../controllers/admin/ad/adminAd.controller';

const router = Router();
router.patch("/admin/ads/activate/:id",verifyIsAdmin, activateAd);
// router.get('/user/:id',verifyUserToken,getUserById);
// router.put("/user/update-businessinfo/:userId", verifyUserToken, updateBusinessInfo);
// router.put("/user/kyc/:userId", verifyUserToken, doKyc);
// router.put("/user/profile/:userId", verifyUserToken,uploadAdImages.single("profilePicUrl"), updateProfile);

export default router;
