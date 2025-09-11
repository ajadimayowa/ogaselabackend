// services/s3Upload.ts
import { Upload } from "@aws-sdk/lib-storage";
import s3 from "../config/s3";
import path from "path";

export async function uploadBufferToS3(file: Express.Multer.File): Promise<{ key: string; url: string }> {
  const bucket = process.env.AWS_BUCKET_NAME!;
  const region = process.env.AWS_REGION!;
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const key = `loan-applications/${file.fieldname}-${uniqueSuffix}${ext}`;

  const parallelUpload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // optional: remove or set to "private" if you want private objects
    },
  });

  await parallelUpload.done(); // throws on failure

  // lib-storage does not always return a stable `Location`, so build the public URL:
  const url = getS3PublicUrl(bucket, key, region);
  return { key, url };
}

function getS3PublicUrl(bucket: string, key: string, region: string) {
  // us-east-1 uses a slightly different host
  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
}
