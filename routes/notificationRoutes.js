const express = require('express');
const mysql = require('mysql');
const router = express.Router();

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Ganti dengan user MySQL Anda
  password: '', // Ganti dengan password MySQL Anda
  database: 'missing_persons_portal',
});

// Koneksi ke MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL');
});

// CREATE Notification (POST)
router.post('/notifications', (req, res) => {
  const { user_id, message } = req.body;
  const sql = `INSERT INTO notifications (user_id, message) VALUES (?, ?)`;
  db.query(sql, [user_id, message], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).send({
      notification_id: result.insertId,
      user_id,
      message,
      is_read: false,
      created_at: new Date(),
    });
  });
});

// READ all notifications (GET)
router.get('/notifications', (req, res) => {
  const sql = `SELECT * FROM notifications`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
});

// READ single notification by ID (GET)
router.get('/notifications/:notification_id', (req, res) => {
  const sql = `SELECT * FROM notifications WHERE notification_id = ?`;
  db.query(sql, [req.params.notification_id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length === 0) {
      return res.status(404).send({ message: 'Notification not found' });
    }
    res.status(200).send(result[0]);
  });
});

// UPDATE Notification by ID (PUT)
router.put('/notifications/:notification_id', (req, res) => {
  const { message, is_read } = req.body;
  const sql = `UPDATE notifications SET message = ?, is_read = ? WHERE notification_id = ?`;
  db.query(sql, [message, is_read, req.params.notification_id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Notification not found' });
    }
    res.status(200).send({
      notification_id: req.params.notification_id,
      message,
      is_read,
    });
  });
});

// DELETE Notification by ID (DELETE)
router.delete('/notifications/:notification_id', (req, res) => {
  const sql = `DELETE FROM notifications WHERE notification_id = ?`;
  db.query(sql, [req.params.notification_id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Notification not found' });
    }
    res.status(200).send({ message: 'Notification deleted successfully' });
  });
});

module.exports = router;
