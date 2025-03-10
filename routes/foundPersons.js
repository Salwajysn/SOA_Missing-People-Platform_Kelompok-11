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

// Get all found persons
router.get('/', (req, res) => {
    db.query('SELECT * FROM found_persons', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        res.json(results);
    });
});

// Get found person by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM found_persons WHERE found_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0){
            return res.status(404).json({error : "Persons not found"})
        }    
        res.json(result[0]);
    });
});

// Create new found person record
router.post('/', (req, res) => {
    const { found_location, found_date, photo_url, description, status } = req.body;

    if (!found_location || !found_date || !photo_url || !description || !status){
        return res.status(404).json({error : "All filed are required"})
    }

    db.query('INSERT INTO found_persons (found_location, found_date, photo_url, description, status) VALUES (?, ?, ?, ?, ?)',
        [found_location, found_date, photo_url, description, status],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database query error', details: err });
            res.json({ message: 'Found person record created successfully', foundId: result.insertId });
        });
});


// Update found person status
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { found_location, found_date, photo_url, description, status } = req.body;

    db.query('select * FROM found_persons  WHERE found_id=?', [id], (err,result) => {
        if (err) return res.status(505).json({error: 'Database query error', details: err});
        if (result.length === 0) {
            return res.status(404).json({ err: 'Found person not found' });
        }

        const oldData = result[0];

        console.log("Request body: ", req.body);
        console.log("Old Data: ", oldData);

        const updateFoundLocation = found_location !== undefined ? found_location : oldData.found_location;
        const updateFoundDate = found_date !== undefined ? found_date : oldData.found_date;
        const updatePhotoUrl = photo_url !== undefined ? photo_url : oldData.photo_url;
        const updateDescription = description !== undefined ? description : oldData.description;
        const updateStatus = status !== undefined ? status : oldData.status;

        console.log("Update Data: ", {
            found_location: updateFoundLocation,
            found_date: updateFoundDate,
            photo_url: updatePhotoUrl,
            description: updateDescription,
            status: updateStatus
        });

        db.query(
            'UPDATE found_persons SET found_location=?, found_date=?, photo_url=?, description=?, status=? WHERE found_id=?',
            [updateFoundLocation, updateFoundDate, updatePhotoUrl, updateDescription, updateStatus, id],
            (err, result) => {
                if (err) return res.status(500).json({error: 'Database update error', details: err});
                if(result.affectedRows === 0){
                    return res.status(404).json({error: 'No change made to the found persons'});
                }
                res.json({message: ' Found person update successfully'});
            }
        );


        });
});


// Delete found person
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM found_persons WHERE found_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Found person not found' });
        }

    db.query('DELETE FROM found_persons WHERE found_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database deletion error', details: err });
        res.json({ message: 'Found person record deleted successfully' });
         });
    });
});


module.exports = router;
