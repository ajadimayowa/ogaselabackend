"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const branch_controller_1 = require("../../controllers/branch-controllers/branch.controller"); // adjust path if needed
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
// @route   POST /api/branches
// @desc    Create a new branch
router.post('/branch/create', auth_middleware_1.verifyToken, branch_controller_1.createBranch);
// @route   GET /api/branches
// @desc    Get branches by optional organizationId and isApproved
router.get('/branch', auth_middleware_1.verifyToken, branch_controller_1.getBranches);
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
exports.default = router;
