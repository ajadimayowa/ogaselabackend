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
exports.uploadBufferToS3 = uploadBufferToS3;
// services/s3Upload.ts
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_1 = __importDefault(require("../config/s3"));
const path_1 = __importDefault(require("path"));
function uploadBufferToS3(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucket = process.env.AWS_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const key = `loan-applications/${file.fieldname}-${uniqueSuffix}${ext}`;
        const parallelUpload = new lib_storage_1.Upload({
            client: s3_1.default,
            params: {
                Bucket: bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read", // optional: remove or set to "private" if you want private objects
            },
        });
        yield parallelUpload.done(); // throws on failure
        // lib-storage does not always return a stable `Location`, so build the public URL:
        const url = getS3PublicUrl(bucket, key, region);
        return { key, url };
    });
}
function getS3PublicUrl(bucket, key, region) {
    // us-east-1 uses a slightly different host
    if (region === "us-east-1") {
        return `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
}
