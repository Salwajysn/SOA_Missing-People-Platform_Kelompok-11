const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET /users/me
router.get('/:id',verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
    console.log('Fetching users with ID:', id);
      const [results] = await db.query(
        'SELECT * FROM users WHERE user_id = ?',
        [id]
      );
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({
        message: 'User data retrieved successfully',
        user: results[0]
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error });
    }
});
  
  // PUT /users/me
router.put('/me', verifyToken, async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { name, email, phone_number } = req.body;
  
      const [existing] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
  
      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const oldData = existing[0];
      const updatedName = name ?? oldData.name;
      const updatedEmail = email ?? oldData.email;
      const updatedPhoneNumber = phone_number ?? oldData.phone_number;
  
      const [updateResult] = await db.query(
        'UPDATE users SET name=?, email=?, phone_number=? WHERE user_id=?',
        [updatedName, updatedEmail, updatedPhoneNumber, userId]
      );
  
      if (updateResult.affectedRows === 0) {
        return res.status(400).json({ error: 'No changes made to the user' });
      }
  
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error });
    }
});
// Get all users
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        res.json(results);
    });
});

// Get user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE user_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result[0]);
    });
});

// Create new user
router.post('/', (req, res) => {
    const { name, email, password, phone_number, role } = req.body;
    if (!name || !email || !password || !phone_number || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.query('INSERT INTO users (name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, phone_number, role],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database insertion error', details: err });
            res.json({ message: 'User created successfully', userId: result.insertId });
        });
});

  
  


// Delete user
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Cek apakah user ada sebelum menghapus
    db.query('SELECT * FROM users WHERE user_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        db.query('DELETE FROM users WHERE user_id = ?', [id], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database deletion error', details: err });
            res.json({ message: 'User deleted successfully' });
        });
    });
});

module.exports = router;
