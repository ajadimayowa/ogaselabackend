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
exports.hasPermission = void 0;
const Role_1 = __importDefault(require("../models/Role"));
const hasPermission = (requiredPermission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.user;
        try {
            const roles = yield Role_1.default.find({ _id: { $in: user.roles } });
            const allPermissions = roles.flatMap(role => role.permissions || []);
            if (!allPermissions.includes(requiredPermission)) {
                return res.status(403).json({ msg: 'Permission denied' });
            }
            next();
        }
        catch (err) {
            res.status(500).json({ msg: 'Permission check failed' });
        }
    });
};
exports.hasPermission = hasPermission;
