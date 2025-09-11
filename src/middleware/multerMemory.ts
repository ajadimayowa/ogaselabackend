import multer, { FileFilterCallback } from "multer";
import path from "path";

const allowed = /jpeg|jpg|png|pdf/;

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export default upload;
