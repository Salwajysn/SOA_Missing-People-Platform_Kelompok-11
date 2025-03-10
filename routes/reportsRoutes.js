const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan user MySQL Anda
    password: '', // Ganti dengan password MySQL Anda
    database: 'missing_persons_portal'
});

// Koneksi ke MySQL
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

// CREATE User (POST)
router.post('/reports', (req, res) => {
    const { user_id, missing_id, description, status } = req.body;
    const sql = `INSERT INTO reports ( user_id, missing_id, description, status) VALUES ( ?, ?, ?, ?)`;
    db.query(sql, [ user_id, missing_id, description, status], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ report_id: result.insertId, user_id, missing_id, description, status });
    });
});

// READ all reports (GET)
router.get('/reports', (req, res) => {
    const sql = `SELECT * FROM reports`;
    db.query(sql, (err, results) => {
    if (err) {
        return res.status(500).send(err);
    }
    res.status(200).send(results);
    });
});

// READ single User by report_id (GET)
router.get('/reports/:report_id', (req, res) => {
    const sql = `SELECT * FROM reports WHERE report_id = ?`;
    db.query(sql, [req.params.report_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(result[0]);
    });
});

// UPDATE reports by nama (PUT)
router.put('/reports/:report_id', (req, res) => {
    const { user_id, missing_id, description, status } = req.body;
    const sql = `UPDATE reports SET user_id = ?, missing_id = ?, description = ?, status = ? WHERE report_id = ?`;
    db.query(sql, [ user_id, missing_id, description, status, req.params.report_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'reports not found' });
        }
        res.status(200).send({ report_id: req.params.report_id, user_id, missing_id, description, status });
    });
});

// DELETE reports by report_id (DELETE)
router.delete('/reports/:report_id', (req, res) => {
    const sql = `DELETE FROM reports WHERE report_id = ?`;
    db.query(sql, [req.params.report_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'reports not found' });
        }
        res.status(200).send({ message: 'reports deleted successfully' });
    });
});
module.exports = router;
