import { Router } from 'express';
import path from 'path';
import upload from '../config/upload.js';

const router = Router();

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  const fileUrl = `../uploads/${path.basename(req.file.filename)}`;

  res.json({
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

export default router;
