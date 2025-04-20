const express = require('express');
const router = express.Router();
const db = require('../db');
const { uploadNewsImage } = require('../middleware/upload'); // Pastikan middleware import sudah benar
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const rateLimiter = require('../middleware/rateLimiting');
const throttling = require('../middleware/throttling');
const client = require('../client'); 


// GET semua berita
router.get('/', throttling, async (req, res) => {
  try {
    const chacedData = await client.get('news:all'); 
    if (chacedData) {
      return res.json(JSON.parse(chacedData)); 
    }
    const [rows] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
    await client.setEx('news:all', 3600, JSON.stringify(rows)); 
    res.json(rows);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// API COMPLEX
// GET berita terbaru (http://localhost:5000/news/latest?limit=5)
router.get('/latest', throttling, async (req, res) => {
  const { limit = 5 } = req.query;  // Default limit 5 berita

  try {
    const cachedData = await client.get(`news:latest`);

    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    const query = `SELECT * FROM news ORDER BY created_at DESC LIMIT ?`;
    const [results] = await db.execute(query, [limit]);

    await client.setEx(`news:latest`, 3600, JSON.stringify(results)); 
    res.json(results);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    res.status(500).json({ error: 'Error fetching latest news' });
  }
});

// API COMPLEX
// GET berita berdasarkan kategori (http://localhost:5000/news/category/missing) 
router.get('/category/:category', throttling, async (req, res) => {
  const { category } = req.params;  // Mengambil kategori dari parameter URL

  try {
    const cachedData = await client.get(`news:category:${category}`);
    if (cachedData) {
      return res.json(JSON.parse(cachedData)); 
    }
    // Query untuk mengambil berita berdasarkan kategori
    const query = `SELECT * FROM news WHERE category = ?`;
    const [results] = await db.execute(query, [category]);

    // Jika tidak ada berita ditemukan, beri respons 404
    if (results.length === 0) {
      return res.status(404).json({ message: 'No news found for this category' });
    }

    // Jika ada berita, kirimkan hasilnya
    await client.setEx(`news:category:${category}`, 3600, JSON.stringify(results));
    res.json(results);
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ error: 'Error fetching news by category' });
  }
});

// API COMPLEX
// GET berita berdasarkan penulis (http://localhost:5000/news/author/:author)
router.get('/author/:author', throttling, async (req, res) => {
  const { author } = req.params;

  try {
    const query = `SELECT * FROM news WHERE author = ?`;
    const [results] = await db.execute(query, [author]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No news found for this author' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching news by author:', error);
    res.status(500).json({ error: 'Error fetching news by author' });
  }
});

// API COMPLEX
// GET jumlah total berita
router.get('/total', throttling ,async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS total_news FROM news`;
    const [results] = await db.execute(query);

    res.json({ total_news: results[0].total_news });
  } catch (error) {
    console.error('Error fetching total news count:', error);
    res.status(500).json({ error: 'Error fetching total news count' });
  }
});

// GET berita berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news WHERE news_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching news by ID:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST berita baru (hanya membutuhkan token login, tidak perlu admin)
router.post('/', rateLimiter, verifyToken, uploadNewsImage.single('image_url'), async (req, res) => {
  console.log("File uploaded:", req.file);  // Menampilkan file gambar yang diupload
  console.log("Form fields:", req.body);  // Menampilkan data form yang dikirim
  console.log("Isi req.user =>", req.user); // DEBUG
  console.log("User ID from token:", req.user?.user_id); // Debugging untuk memastikan user_id ada
  
  const { title, description, category, author } = req.body;
  
  // Pastikan file gambar ada
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  // Ambil path file gambar setelah upload
  const photoPath = req.file ? req.file.path : null;
  const userId = req.user.user_id; // ← PERBAIKAN DI SINI
  console.log("File image_url:", photoPath);  // Menampilkan path gambar yang disalin ke folder

  // Validasi input form
  if (!title || !description || !category || !author) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Menyimpan data berita ke database
    await db.query(
      'INSERT INTO news (user_id, title, description, category, image_url, author) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, description, category, photoPath, author]
    );
    // clear cache
    await client.del('news:all'); 
    await client.del(`news:latest`);
    await client.del(`news:category:${category}`); 
    res.status(201).json({ message: 'News created successfully' });
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// PUT update berita
router.put('/:id',rateLimiter, verifyToken, async (req, res) => {
  const { title, description, category, image_url, author } = req.body;
  
  if (!title || !description || !category || !image_url || !author) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [result] = await db.query(
      'UPDATE news SET title = ?, description = ?, category = ?, image_url = ?, author = ?, updated_at = CURRENT_TIMESTAMP WHERE news_id = ?',
      [title, description, category, image_url, author, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

        // clear cache
        await client.del('news:all'); 
        await client.del(`news:latest`);
        await client.del(`news:category:${category}`); 
    res.json({ message: 'News updated successfully' });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// DELETE berita
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM news WHERE news_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

        // clear cache
        await client.del('news:all'); 
        await client.del(`news:latest`);
        await client.del(`news:category:${category}`); 
    res.json({ message: 'News deleted successfully' });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

module.exports = router;
