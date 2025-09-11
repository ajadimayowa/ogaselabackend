// routes/upload.ts
import express from "express";
import upload from "./multerMemory";
import { uploadBufferToS3 } from "../services/s3Upload";

const router = express.Router();

router.post("/loan-application", upload.single("document"), async (req:any, res:any) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const { key, url } = await uploadBufferToS3(file);
    res.json({ message: "Uploaded successfully", key, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: (err as Error).message });
  }
});

// multiple files example
router.post("/loan-application/multi", upload.array("documents", 5), async (req:any, res:any) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) return res.status(400).json({ message: "No files uploaded" });

  try {
    const uploads = await Promise.all(files.map(uploadBufferToS3));
    res.json({ message: "All uploaded", uploads }); // uploads: [{key, url}, ...]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: (err as Error).message });
  }
});

export default router;
