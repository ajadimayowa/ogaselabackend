"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { register, login } from '../controllers/auth.controller';
const user_1 = require("../controllers/auth/user");
const router = (0, express_1.Router)();
router.post('/auth/register', user_1.createUser);
router.post('/auth/login', user_1.loginUser);
router.post('/auth/verify-otp', user_1.verifyLoginOtp);
router.post('/auth/verify-email-otp', user_1.verifyUserEmail);
router.post('/auth/request-password-reset-otp', user_1.requestPasswordResetOtp);
router.post('/auth/reset-password-with-otp', user_1.resetUserPasswordWithOtp);
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
