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
const mongoose_1 = __importDefault(require("mongoose"));
const permissions_1 = require("../constants/permissions");
const Permissions_model_1 = require("../models/Permissions.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function seedPermissions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGO_URI);
            for (const perm of permissions_1.GLOBAL_PERMISSIONS) {
                const exists = yield Permissions_model_1.Permission.findOne({ name: perm.name });
                if (!exists) {
                    yield Permissions_model_1.Permission.create(perm);
                    console.log(`✅ Added permission: ${perm.name}`);
                }
                else {
                    console.log(`⚠️ Skipped existing: ${perm.name}`);
                }
            }
            console.log('🌱 Seeding complete.');
            process.exit(0);
        }
        catch (err) {
            console.error('❌ Seeding error:', err);
            process.exit(1);
        }
    });
}
seedPermissions();
