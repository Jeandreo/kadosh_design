import { Router } from 'express';
import crypto from 'crypto';

import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';
import { extractS3Key } from '../utils/s3Key.js';
import { deleteFromS3 } from '../services/s3Delete.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.*,
        GROUP_CONCAT(c.name) AS categories
      FROM resources r
      LEFT JOIN resource_categories rc ON rc.resource_id = r.id
      LEFT JOIN categories c ON c.id = rc.category_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);

    const resources = rows.map(r => ({
      ...r,
      categories: r.categories ? r.categories.split(',') : [],
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar recursos' });
  }
});


router.post('/', checkDb, async (req, res) => {
  const data = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const resourceId = data.id || crypto.randomUUID();
    const tagsJson = JSON.stringify(data.tags || []);

    // 1️⃣ Insere resource
    await connection.query(
      `INSERT INTO resources
       (id, title, image_url, watermark_image_url, download_url,
        tags, search_terms, premium, format, orientation,
        downloads, canva_available, canva_url, resolution,
        dimensions, file_size, author)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resourceId,
        data.title,
        data.imageUrl,
        data.watermarkImageUrl,
        data.downloadUrl,
        tagsJson,
        data.searchTerms,
        data.premium,
        data.format,
        data.orientation,
        0,
        data.canvaAvailable,
        data.canvaUrl,
        data.resolution,
        data.dimensions,
        data.fileSize,
        data.author
      ]
    );

    // Relaciona categorias
    if (Array.isArray(data.categories)) {
      for (const categoryName of data.categories) {
        const [[category]] = await connection.query(
          'SELECT id FROM categories WHERE name = ?',
          [categoryName]
        );

        if (category) {
          await connection.query(
            `INSERT INTO resource_categories (resource_id, category_id)
             VALUES (?, ?)`,
            [resourceId, category.id]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Recurso criado' });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erro ao salvar recurso' });
  } finally {
    connection.release();
  }
});


router.put('/:id', checkDb, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const tagsJson = JSON.stringify(data.tags || []);

    await connection.query(
      `UPDATE resources SET
        title = ?,
        image_url = ?,
        watermark_image_url = ?,
        download_url = ?,
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
        data.title,
        data.imageUrl,
        data.watermarkImageUrl,
        data.downloadUrl,
        tagsJson,
        data.searchTerms,
        data.premium,
        data.format,
        data.orientation,
        data.canvaAvailable,
        data.canvaUrl,
        data.resolution,
        data.dimensions,
        data.fileSize,
        id
      ]
    );

    // remove categorias antigas
    await connection.query(
      'DELETE FROM resource_categories WHERE resource_id = ?',
      [id]
    );

    // adiciona novas
    if (Array.isArray(data.categories)) {
      for (const categoryName of data.categories) {
        const [[category]] = await connection.query(
          'SELECT id FROM categories WHERE name = ?',
          [categoryName]
        );

        if (category) {
          await connection.query(
            `INSERT INTO resource_categories (resource_id, category_id)
             VALUES (?, ?)`,
            [id, category.id]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Recurso atualizado' });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar recurso' });
  } finally {
    connection.release();
  }
});


router.delete('/:id', checkDb, async (req, res) => {
  const conn = pool;

  try {
    // 1️⃣ Buscar resource
    const [rows] = await conn.query(
      'SELECT image_url, watermark_image_url, download_url FROM resources WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Recurso não encontrado' });
    }

    const resource = rows[0];

    // 2️⃣ Deletar arquivos no S3
    const urls = [
      resource.image_url,
      resource.watermark_image_url,
      resource.download_url,
    ].filter(Boolean);

    for (const url of urls) {
      const key = extractS3Key(url);
      if (key) {
        await deleteFromS3(key);
      }
    }

    // 3️⃣ Deletar do banco
    await conn.query(
      'DELETE FROM resources WHERE id = ?',
      [req.params.id]
    );

    return res.json({ message: 'Deletado com sucesso' });

  } catch (err) {
    console.error('DELETE RESOURCE ERROR:', err);
    return res.status(500).json({ error: 'Erro ao deletar recurso' });
  }
});


export default router;
