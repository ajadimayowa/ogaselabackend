import { Router } from "express";
import {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
  addRepayment,
} from  "../../controllers/loanControllers/loan.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = Router();

// ================= LOAN ROUTES =================

// Create new loan (by marketer for customer)
router.post("/loan", verifyToken, createLoan);

// Get all loans
router.get("/loans",verifyToken, getLoans);

// Get loan by ID
router.get("/loan/:id",verifyToken, getLoanById);

// Update loan (only before authorization/disbursement)
router.put("/:id",verifyToken, updateLoan);

// Delete loan (only if still pending)
router.delete("/:id",verifyToken, deleteLoan);

// Add repayment
router.post("/:id/repayments",verifyToken, addRepayment);

export default router;
