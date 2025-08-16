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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissions = void 0;
const Permissions_model_1 = require("../../models/Permissions.model");
const getPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permissions = Permissions_model_1.Permission.find();
    return res.status(201).json({
        success: true,
        message: '',
        payload: { data: permissions, pagination: { totalItems: 20, pageNumber: 10, currentPage: 1 } },
    });
});
exports.getPermissions = getPermissions;
