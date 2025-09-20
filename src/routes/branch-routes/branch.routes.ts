import { Router } from "express";
import { 
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  addStaffToBranch, 
  updateBranchBankDetails
 } from "../../controllers/branch-controllers/branch.controller";
import { isSuperAdmin, verifyToken } from "../../middleware/auth.middleware";
import { fundBranch } from "../../controllers/branch-controllers/fundBranch.controller";

const router = Router();

router.post("/branch",verifyToken,isSuperAdmin, createBranch);
router.get("/branches",verifyToken,isSuperAdmin,  getBranches);
router.get("/branch/:id",verifyToken,isSuperAdmin,  getBranchById);
router.put("/branch/:id",verifyToken,isSuperAdmin,  updateBranch);
router.put("/branch/update-account/:id",verifyToken,updateBranchBankDetails);

router.post("/branch/fund",verifyToken, fundBranch);
router.delete("/branch/:id",verifyToken,isSuperAdmin,  deleteBranch);

router.post("/branch/add-staff",verifyToken,isSuperAdmin, addStaffToBranch);

export default router;
