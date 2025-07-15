"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import { register, login } from '../controllers/auth.controller';
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// router.post('/register-super-admin',registerSuperAdmin);
router.post('/auth/register-staff', (req, res, next) => {
    Promise.resolve((0, auth_controller_1.adminRegisterStaff)(req, res)).catch(next);
});
router.put('/auth/update-staff', (req, res, next) => {
    Promise.resolve((0, auth_controller_1.adminRegisterStaff)(req, res)).catch(next);
});
router.post('/auth/verify-email', (req, res, next) => {
    Promise.resolve((0, auth_controller_1.adminRegisterStaff)(req, res)).catch(next);
});
// router.post('/login', (req, res, next) => {
//   Promise.resolve(staffLogin(req, res)).catch(next);
// });
router.post('/verify-login-otp', (req, res, next) => {
    Promise.resolve((0, auth_controller_1.verifyOtp)(req, res)).catch(next);
});
exports.default = router;
