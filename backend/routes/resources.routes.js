import { Router } from 'express';
import crypto from 'crypto';

import pool from '../db/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM resources ORDER BY created_at DESC'
    );

    const resources = rows.map(r => ({
      ...r,
      categories: r.category ? [r.category] : [],
      tags: r.tags ? JSON.parse(r.tags) : [],
      searchTerms: r.search_terms,
      imageUrl: r.image_url,
      watermarkImageUrl: r.watermark_image_url,
      downloadUrl: r.download_url,
      canvaAvailable: !!r.canva_available,
      canvaUrl: r.canva_url,
      premium: !!r.premium,
      fileSize: r.file_size
    }));

    res.json(resources);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar recursos' });
  }
});

router.post('/', checkDb, async (req, res) => {
  const resData = req.body;

  try {
    const id = resData.id || crypto.randomUUID();
    const tagsJson = JSON.stringify(resData.tags || []);

    await pool.query(
      `INSERT INTO resources
       (id, title, image_url, watermark_image_url, download_url,
        category, tags, search_terms, premium, format, orientation,
        downloads, canva_available, canva_url, resolution,
        dimensions, file_size, author)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        resData.title,
        resData.imageUrl,
        resData.watermarkImageUrl,
        resData.downloadUrl,
        resData.categories?.[0],
        tagsJson,
        resData.searchTerms,
        resData.premium,
        resData.format,
        resData.orientation,
        0,
        resData.canvaAvailable,
        resData.canvaUrl,
        resData.resolution,
        resData.dimensions,
        resData.fileSize,
        resData.author
      ]
    );

    res.status(201).json({ message: 'Recurso criado' });
  } catch {
    res.status(500).json({ message: 'Erro ao salvar' });
  }
});

router.put('/:id', checkDb, async (req, res) => {
  const { id } = req.params;
  const resData = req.body;

  try {
    const tagsJson = JSON.stringify(resData.tags || []);

    await pool.query(
      `UPDATE resources SET
        title = ?,
        image_url = ?,
        watermark_image_url = ?,
        download_url = ?,
        category = ?,
        tags = ?,
        search_terms = ?,
        premium = ?,
        format = ?,
        orientation = ?,
        canva_available = ?,
        canva_url = ?,
        resolution = ?,
        dimensions = ?,
        file_size = ?
       WHERE id = ?`,
      [
        resData.title,
        resData.imageUrl,
        resData.watermarkImageUrl,
        resData.downloadUrl,
        resData.categories?.[0],
        tagsJson,
        resData.searchTerms,
        resData.premium,
        resData.format,
        resData.orientation,
        resData.canvaAvailable,
        resData.canvaUrl,
        resData.resolution,
        resData.dimensions,
        resData.fileSize,
        id
      ]
    );

    res.json({ message: 'Recurso atualizado' });
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar' });
  }
});

router.delete('/:id', checkDb, async (req, res) => {
  try {
    await pool.query('DELETE FROM resources WHERE id = ?', [
      req.params.id
    ]);
    res.json({ message: 'Deletado' });
  } catch {
    res.status(500).send();
  }
});

export default router;
