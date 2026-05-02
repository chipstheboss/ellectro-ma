import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import mysql from 'mysql2/promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'ellectro_ma',
  waitForConnections: true,
  connectionLimit: 10
});

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
    callback(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image files are allowed.'));
      return;
    }

    callback(null, true);
  }
});

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token.' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authorization token.' });
  }
};

const publicImageUrl = (req, filename) => `${req.protocol}://${req.get('host')}/uploads/${filename}`;

const getUploadedFilenameFromUrl = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const marker = '/uploads/';
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return '';
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    const marker = '/uploads/';
    const markerIndex = imageUrl.indexOf(marker);

    return markerIndex === -1 ? '' : imageUrl.slice(markerIndex + marker.length);
  }
};

const removeUploadedFile = (imageUrl) => {
  const filename = getUploadedFilenameFromUrl(imageUrl);

  if (!filename) return;

  const filePath = path.join(uploadsDir, filename);

  if (!filePath.startsWith(uploadsDir)) return;

  fs.rm(filePath, { force: true }, () => {});
};

const syncPrimaryProductImage = async (connection, productId) => {
  const [rows] = await connection.execute(
    'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1',
    [productId]
  );

  await connection.execute(
    'UPDATE products SET image = ? WHERE id = ?',
    [rows[0]?.image_url || '', productId]
  );
};

const mapProductRows = (rows) => {
  const productMap = new Map();

  rows.forEach((row) => {
    if (!productMap.has(row.id)) {
      productMap.set(row.id, {
        id: row.id,
        name: row.name,
        price: Number(row.price),
        description: row.description,
        category: row.category,
        image: row.image || '',
        images: [],
        imageItems: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    }

    if (row.image_url) {
      const product = productMap.get(row.id);

      product.images.push(row.image_url);
      product.imageItems.push({
        id: row.image_id,
        url: row.image_url,
        sortOrder: row.sort_order
      });
    }
  });

  return Array.from(productMap.values()).map((product) => ({
    ...product,
    images: product.images.length > 0 ? product.images : product.image ? [product.image] : []
  }));
};

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || error.code || 'Database connection failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ellectro.ma';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ email }, jwtSecret, { expiresIn: '8h' });
  return res.json({ token, user: { email } });
});

app.get('/api/auth/me', authenticateAdmin, (req, res) => {
  res.json({ user: { email: req.user.email } });
});

app.get('/api/products', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pi.id AS image_id, pi.image_url, pi.sort_order
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      ORDER BY p.id DESC, pi.sort_order ASC
    `);

    res.json(mapProductRows(rows));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pi.id AS image_id, pi.image_url, pi.sort_order
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.category = ?
      ORDER BY p.id DESC, pi.sort_order ASC
    `, [req.params.category]);

    res.json(mapProductRows(rows));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pi.id AS image_id, pi.image_url, pi.sort_order
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id
      WHERE p.id = ?
      ORDER BY pi.sort_order ASC
    `, [req.params.id]);

    const [product] = mapProductRows(rows);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', authenticateAdmin, upload.array('images', 8), async (req, res) => {
  const { name, price, description, category } = req.body;
  const imageUrls = (req.files || []).map((file) => publicImageUrl(req, file.filename));
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)',
      [name, Number(price), description, category, imageUrls[0] || '']
    );

    const productId = result.insertId;

    for (let index = 0; index < imageUrls.length; index += 1) {
      await connection.execute(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
        [productId, imageUrls[index], index]
      );
    }

    await connection.commit();
    res.status(201).json({ id: productId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  const { name, price, description, category } = req.body;

  try {
    await pool.execute(
      'UPDATE products SET name = ?, price = ?, description = ?, category = ? WHERE id = ?',
      [name, Number(price), description, category, req.params.id]
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products/:id/images', authenticateAdmin, upload.array('images', 8), async (req, res) => {
  const productId = req.params.id;
  const imageUrls = (req.files || []).map((file) => publicImageUrl(req, file.filename));
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxSortOrder FROM product_images WHERE product_id = ?',
      [productId]
    );
    let nextSortOrder = Number(existingRows[0].maxSortOrder) + 1;

    for (const imageUrl of imageUrls) {
      await connection.execute(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
        [productId, imageUrl, nextSortOrder]
      );
      nextSortOrder += 1;
    }

    await syncPrimaryProductImage(connection, productId);
    await connection.commit();

    res.status(201).json({ ok: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.put('/api/products/:id/images/order', authenticateAdmin, async (req, res) => {
  const productId = req.params.id;
  const { imageIds } = req.body;

  if (!Array.isArray(imageIds)) {
    return res.status(400).json({ message: 'imageIds must be an array.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (let index = 0; index < imageIds.length; index += 1) {
      await connection.execute(
        'UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?',
        [index, imageIds[index], productId]
      );
    }

    await syncPrimaryProductImage(connection, productId);
    await connection.commit();

    return res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/products/:productId/images/:imageId', authenticateAdmin, async (req, res) => {
  const { productId, imageId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      'SELECT image_url FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Image not found.' });
    }

    await connection.execute(
      'DELETE FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );
    await syncPrimaryProductImage(connection, productId);
    await connection.commit();

    removeUploadedFile(rows[0].image_url);
    return res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use((error, _req, res, next) => {
  void next;
  res.status(400).json({ message: error.message });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
