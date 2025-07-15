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
exports.removeRolesFromUser = exports.assignRolesToUser = void 0;
const Staff_1 = __importDefault(require("../models/Staff"));
// Assign roles to a user
const assignRolesToUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId, roleIds } = req.body;
    try {
        const user = yield Staff_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        user.roles = [...new Set([...((_a = user.roles) !== null && _a !== void 0 ? _a : []), ...roleIds])];
        yield user.save();
        res.status(200).json({ msg: 'Roles assigned', roles: user.roles });
    }
    catch (err) {
        res.status(500).json({ msg: 'Failed to assign roles' });
    }
});
exports.assignRolesToUser = assignRolesToUser;
// Remove roles from a user
const removeRolesFromUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId, roleIds } = req.body;
    try {
        const user = yield Staff_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ msg: 'User not found' });
        user.roles = ((_a = user.roles) !== null && _a !== void 0 ? _a : []).filter(r => !roleIds.includes(r.toString()));
        yield user.save();
        res.status(200).json({ msg: 'Roles removed', roles: user.roles });
    }
    catch (err) {
        res.status(500).json({ msg: 'Failed to remove roles' });
    }
});
exports.removeRolesFromUser = removeRolesFromUser;
