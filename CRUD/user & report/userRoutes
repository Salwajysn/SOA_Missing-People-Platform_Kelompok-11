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
router.post('/users', (req, res) => {
    const { name, email, password, phone_number, role } = req.body;
    const sql = `INSERT INTO users (name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, password, phone_number, role], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ user_id: result.insertId, name, email, password, phone_number, role });
    });
});

// READ all users (GET)
router.get('/users', (req, res) => {
    const sql = `SELECT * FROM users`;
    db.query(sql, (err, results) => {
    if (err) {
        return res.status(500).send(err);
    }
    res.status(200).send(results);
    });
});

// READ single User by user_id (GET)
router.get('/users/:user_id', (req, res) => {
    const sql = `SELECT * FROM users WHERE user_id = ?`;
    db.query(sql, [req.params.user_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(result[0]);
    });
});

// UPDATE users by user_id (PUT)
router.put('/users/:user_id', (req, res) => {
    const { name, email, password, phone_number, role } = req.body;
    const sql = `UPDATE users SET name = ?, email = ?, password = ?, phone_number = ?, role = ? WHERE user_id = ?`;
    db.query(sql, [name, email, password, phone_number, role, req.params.user_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'users not found' });
        }
        res.status(200).send({ name: req.params.user_id, email, password, phone_number, role });
    });
});

// DELETE users by name (DELETE)
router.delete('/users/:user_id', (req, res) => {
    const sql = `DELETE FROM users WHERE user_id = ?`;
    db.query(sql, [req.params.user_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'users not found' });
        }
        res.status(200).send({ message: 'users deleted successfully' });
    });
});
module.exports = router;
