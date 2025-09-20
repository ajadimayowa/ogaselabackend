"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("../../controllers/loanControllers/loan.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ================= LOAN ROUTES =================
// Create new loan (by marketer for customer)
router.post("/loan", auth_middleware_1.verifyToken, loan_controller_1.createLoan);
// Get all loans
router.get("/loans", auth_middleware_1.verifyToken, loan_controller_1.getLoans);
// Get loan by ID
router.get("/loan/:id", auth_middleware_1.verifyToken, loan_controller_1.getLoanById);
// Update loan (only before authorization/disbursement)
router.put("/:id", auth_middleware_1.verifyToken, loan_controller_1.updateLoan);
// Delete loan (only if still pending)
router.delete("/:id", auth_middleware_1.verifyToken, loan_controller_1.deleteLoan);
// Add repayment
router.post("/:id/repayments", auth_middleware_1.verifyToken, loan_controller_1.addRepayment);
exports.default = router;
