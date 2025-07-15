"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkModuleAccess = void 0;
const Organization_1 = __importDefault(require("../models/Organization"));
const checkModuleAccess = (requiredPlan) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const user = req.user;
        try {
            const org = yield Organization_1.default.findById(user.organization);
            if (!org)
                return res.status(404).json({ msg: 'Organization not found' });
            const plans = ['basic', 'standard', 'pro'];
            const orgPlan = (_a = org === null || org === void 0 ? void 0 : org.orgSubscriptionPlan) !== null && _a !== void 0 ? _a : '';
            const hasAccess = plans.indexOf(orgPlan) >= plans.indexOf(requiredPlan);
            if (!hasAccess) {
                return res.status(403).json({ msg: `Access denied. ${requiredPlan} plan required.` });
            }
            next();
        }
        catch (err) {
            res.status(500).json({ msg: 'Access check failed' });
        }
    });
};
exports.checkModuleAccess = checkModuleAccess;
