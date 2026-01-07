import { Router } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';

import upload from '../config/upload.js';
import { s3 } from '../services/s3.js';

const router = Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    const ext = path.extname(req.file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${filename}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${filename}`;

    return res.json({
      url: fileUrl,
      filename,
      size: req.file.size,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao enviar para o S3' });
  }
});

export default router;
