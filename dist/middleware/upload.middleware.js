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
// routes/upload.ts
const express_1 = __importDefault(require("express"));
const multerMemory_1 = __importDefault(require("./multerMemory"));
const s3Upload_1 = require("../services/s3Upload");
const router = express_1.default.Router();
router.post("/loan-application", multerMemory_1.default.single("document"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: "No file uploaded" });
    try {
        const { key, url } = yield (0, s3Upload_1.uploadBufferToS3)(file);
        res.json({ message: "Uploaded successfully", key, url });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
}));
// multiple files example
router.post("/loan-application/multi", multerMemory_1.default.array("documents", 5), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    if (!files || files.length === 0)
        return res.status(400).json({ message: "No files uploaded" });
    try {
        const uploads = yield Promise.all(files.map(s3Upload_1.uploadBufferToS3));
        res.json({ message: "All uploaded", uploads }); // uploads: [{key, url}, ...]
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
}));
exports.default = router;
