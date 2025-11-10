import { Router } from 'express';
// import { register, login } from '../controllers/auth.controller';
import { createUser,loginUser,verifyUserEmail,verifyLoginOtp, requestPasswordResetOtp,resetUserPasswordWithOtp } from '../controllers/auth/user';
import { verifyToken } from '../middleware/auth.middleware';
import { verifyTurnstile } from '../middleware/verifyTurnstile';

const router = Router();

router.post('/auth/register', createUser);
router.post('/auth/login', loginUser);
router.post('/auth/verify-otp', verifyLoginOtp);
router.post('/auth/verify-email-otp', verifyUserEmail);
router.post('/auth/request-password-reset-otp', requestPasswordResetOtp);
router.post('/auth/reset-password-with-otp', resetUserPasswordWithOtp);



// router.post('/register-staff', (req, res, next) => {
//   Promise.resolve(adminRegisterStaff(req, res)).catch(next);
// });

// router.put('/update-staff', (req, res, next) => {
//   Promise.resolve(adminRegisterStaff(req, res)).catch(next);
// });

// router.post('/verify-email', (req, res, next) => {
//   Promise.resolve(adminRegisterStaff(req, res)).catch(next);
// });




// router.post('/login', (req, res, next) => {
//   Promise.resolve(staffLogin(req, res)).catch(next);
// });

// router.post('/verify-login-otp', (req, res, next) => {
//   Promise.resolve(verifyOtp(req, res)).catch(next);
// });

export default router;