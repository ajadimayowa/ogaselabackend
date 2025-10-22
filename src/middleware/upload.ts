import { S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

const { AWS_REGION, AWS_BUCKET_NAME } = process.env;

if (!AWS_REGION || !AWS_BUCKET_NAME) {
  throw new Error("Missing required AWS configuration: region or bucket name");
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: fromEnv(),
});

export const createUpload = (folder: string) =>
  multer({
    storage: multerS3({
      s3: s3Client,
      bucket: AWS_BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, `${folder}/${fileName}`);
      },
    }),
  });

// ✅ Export for ads (images folder)
export const uploadAdImages = createUpload("images/product-pictures/");

export default uploadAdImages;