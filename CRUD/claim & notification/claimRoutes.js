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

// CREATE Claim (POST)
router.post('/claims', (req, res) => {
  const { user_id, found_id, relationship, evidence_url, found_location, status } = req.body;
  const sql = `INSERT INTO claims (user_id, found_id, relationship, evidence_url, found_location, status) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [user_id, found_id, relationship, evidence_url, found_location, status || 'pending'], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).send({ claim_id: result.insertId, user_id, found_id, relationship, evidence_url, found_location, status: status || 'pending' });
  });
});

// READ all Claims (GET)
router.get('/claims', (req, res) => {
  const sql = `SELECT * FROM claims`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
});

// READ single Claim by claim_id (GET)
router.get('/claims/:claim_id', (req, res) => {
  const sql = `SELECT * FROM claims WHERE claim_id = ?`;
  db.query(sql, [req.params.claim_id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res.status(404).send({ message: 'Claim not found' });
    }
    res.status(200).send(result[0]);
  });
});

// UPDATE Claim by claim_id (PUT)
router.put('/claims/:claim_id', (req, res) => {
  const { user_id, found_id, relationship, evidence_url, found_location, status } = req.body;
  const sql = `UPDATE claims SET user_id = ?, found_id = ?, relationship = ?, evidence_url = ?, found_location = ?, status = ? WHERE claim_id = ?`;
  db.query(sql, [user_id, found_id, relationship, evidence_url, found_location, status, req.params.claim_id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Claim not found' });
    }
    res.status(200).send({ claim_id: req.params.claim_id, user_id, found_id, relationship, evidence_url, found_location, status });
  });
});

// DELETE Claim by claim_id (DELETE)
router.delete('/claims/:claim_id', (req, res) => {
  const sql = `DELETE FROM claims WHERE claim_id = ?`;
  db.query(sql, [req.params.claim_id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Claim not found' });
    }
    res.status(200).send({ message: 'Claim deleted successfully' });
  });
});

module.exports = router;
