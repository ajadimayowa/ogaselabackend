import { Router } from 'express';
// import { register, login } from '../controllers/auth.controller';
import { adminRegisterStaff,verifyOtp } from '../controllers/auth.controller';

const router = Router();

// router.post('/register-super-admin',registerSuperAdmin);

router.post('/auth/register-staff', (req, res, next) => {
  Promise.resolve(adminRegisterStaff(req, res)).catch(next);
});

router.put('/auth/update-staff', (req, res, next) => {
  Promise.resolve(adminRegisterStaff(req, res)).catch(next);
});

router.post('/auth/verify-email', (req, res, next) => {
  Promise.resolve(adminRegisterStaff(req, res)).catch(next);
});




// router.post('/login', (req, res, next) => {
//   Promise.resolve(staffLogin(req, res)).catch(next);
// });

router.post('/verify-login-otp', (req, res, next) => {
  Promise.resolve(verifyOtp(req, res)).catch(next);
});

export default router;
