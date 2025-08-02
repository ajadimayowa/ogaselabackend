import express from 'express';
import {
  createBranch,
  getBranches,
  getBranch,
  updateBranch,
  deleteBranch,
  approveBranch
} from '../../controllers/branch-controllers/branch.controller'; // adjust path if needed
import { verifyToken } from '../../middleware/auth.middleware';

const router = express.Router();

// @route   POST /api/branches
// @desc    Create a new branch
router.post('/branch/create', verifyToken, createBranch);

// @route   GET /api/branches
// @desc    Get branches by optional organizationId and isApproved
router.get('/branch', verifyToken, getBranches);

// @route   GET /api/branches/:id
// @desc    Get a single branch by ID
// router.get('/:id', getBranch);

// @route   PUT /api/branches/:id
// @desc    Update branch by ID
// router.put('/:id', updateBranch);

// @route   DELETE /api/branches/:id
// @desc    Soft delete a branch by ID
// router.delete('/:id', deleteBranch);

// @route   PUT /api/branches/:id/approve
// @desc    Approve a branch
// router.put('/:id/approve', approveBranch);

export default router;