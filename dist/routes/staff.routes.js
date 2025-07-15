"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { register, login } from '../controllers/auth.controller';
const staff_controllers_1 = require("../controllers/staff-controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const staff_1 = require("../controllers/auth/staff");
const router = (0, express_1.Router)();
router.post('/staff/create-superadmin', auth_middleware_1.isCreator, staff_controllers_1.registerSuperAdmin);
router.post('/staff/create-staff', auth_middleware_1.isSuperAdmin, staff_controllers_1.createStaff);
router.post('/staff/login', staff_1.loginStaff);
router.post('/staff/verify-otp', staff_1.verifyLoginOtp);
router.post('/staff/request-password-reset-otp', staff_1.requestPasswordResetOtp);
router.post('/staff/reset-password-with-otp', staff_1.resetStaffPasswordWithOtp);
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
exports.default = router;
