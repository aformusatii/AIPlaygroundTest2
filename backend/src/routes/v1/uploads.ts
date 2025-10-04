import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const ensureUploadDir = () => {
  if (!fs.existsSync(env.uploadDir)) {
    fs.mkdirSync(env.uploadDir, { recursive: true });
  }
};

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  },
});

const upload = multer({ storage });

export const uploadsRouter = (): Router => {
  const router = Router();

  router.post(
    '/',
    upload.single('file'),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, error: { message: 'File is required' } });
      }
      const url = `/uploads/${req.file.filename}`;
      res.status(201).json({ success: true, data: { url } });
    }),
  );

  return router;
};
