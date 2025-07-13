import { Router } from 'express';
// import { register, login } from '../controllers/auth.controller';
import { createStaff, registerSuperAdmin } from '../controllers/staff-controllers';
import { isCreator, isSuperAdmin, verifyToken } from '../middleware/auth.middleware';
import { loginStaff,verifyOtp } from '../controllers/auth/staff';

const router = Router();

router.post('/staff/create-superadmin',isCreator, registerSuperAdmin);
router.post('/staff/create-staff',isSuperAdmin, createStaff);
router.post('/staff/login', loginStaff);
router.post('/staff/verify-otp', verifyOtp);

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
