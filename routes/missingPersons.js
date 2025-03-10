const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Ganti dengan user MySQL Anda
  password: '', // Ganti dengan password MySQL Anda
  database: 'missing_persons_portal' // Nama database
});

// Koneksi ke MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL');
});
// Get all missing persons
router.get('/', (req, res) => {
    db.query('SELECT * FROM missing_persons', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        res.json(results);
    });
});

// Get missing person by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM missing_persons WHERE missing_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: "Missing person not found" });
        }
        res.json(result[0]);
    });
});

// Create new missing person report
router.post('/', (req, res) => {
    const { full_name, age, gender, height, weight, last_seen_location, last_seen_date, photo_url, status } = req.body;
    
    if (!full_name || !age || !gender || !height || !weight || !last_seen_location || !last_seen_date || !photo_url || !status) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.query('INSERT INTO missing_persons (full_name, age, gender, height, weight, last_seen_location, last_seen_date, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [full_name, age, gender, height, weight, last_seen_location, last_seen_date, photo_url, status],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database insertion error', details: err });
            res.json({ message: 'Missing person report created successfully', missingId: result.insertId });
        });
});

// Update missing person details
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, age, gender, height, weight, last_seen_location, last_seen_date, photo_url, status } = req.body;

    db.query('SELECT * FROM missing_persons WHERE missing_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Missing person not found' });
        }

        const oldData = result[0];

        console.log("Request Body:", req.body);
        console.log("Old Data:", oldData);

        // Jika field tidak dikirim, gunakan nilai lama
        const updatedFullName = full_name !== undefined ? full_name : oldData.full_name;
        const updatedAge = age !== undefined ? age : oldData.age;
        const updatedGender = gender !== undefined ? gender : oldData.gender;
        const updateHeight = height !== undefined ? height : oldData.height;
        const updateWeight = weight !== undefined ? weight : oldData.weight;
        const updatedLastSeenLocation = last_seen_location !== undefined ? last_seen_location : oldData.last_seen_location;
        const updatedLastSeenDate = last_seen_date !== undefined ? last_seen_date : oldData.last_seen_date;
        const updatedPhotoUrl = photo_url !== undefined ? photo_url : oldData.photo_url;
        const updatedStatus = status !== undefined ? status : oldData.status;

        console.log("Updated Data:", {
            full_name: updatedFullName,
            age: updatedAge,
            gender: updatedGender,
            height: updateHeight,
            weight: updateWeight,
            last_seen_location: updatedLastSeenLocation,
            last_seen_date: updatedLastSeenDate,
            photo_url: updatedPhotoUrl,
            status: updatedStatus
        });

        db.query(
            'UPDATE missing_persons SET full_name=?, age=?, gender=?, height=?, weight=?, last_seen_location=?, last_seen_date=?, photo_url=?, status=? WHERE missing_id=?',
            [updatedFullName, updatedAge, updatedGender, updateHeight, updateWeight, updatedLastSeenLocation, updatedLastSeenDate, updatedPhotoUrl, updatedStatus, id],
            (err, result) => {
                if (err) return res.status(500).json({ error: 'Database update error', details: err });

                if (result.affectedRows === 0) {
                    return res.status(400).json({ error: 'No changes made to the missing person' });
                }

                res.json({ message: 'Missing person updated successfully' });
            }
        );
    });
});

// Delete missing person
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Cek apakah data ada sebelum menghapus
    db.query('SELECT * FROM missing_persons WHERE missing_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Missing person not found' });
        }

        db.query('DELETE FROM missing_persons WHERE missing_id = ?', [id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database deletion error', details: err });
            res.json({ message: 'Missing person deleted successfully' });
        });
    });
});

module.exports = router;
