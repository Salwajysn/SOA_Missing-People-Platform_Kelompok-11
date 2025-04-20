const express = require('express');
const router = express.Router();
const db = require('../db');
const { claimFound } = require('../middleware/upload');
const verifyToken = require('../middleware/verifyToken');
const client = require('../client');
const rateLimiter = require('../middleware/rateLimiting');
const throttling = require('../middleware/throttling');

// Get all claims
router.get('/', throttling, async(req, res) => {
    const cachedData = await client.get('claims:all');
    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }

    db.query('SELECT * FROM claims', async(err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        await client.setEx('claims:all', 3600, JSON.stringify(results));
        res.json(results);
    });
});

// Get claim by ID
router.get('/:id', async(req, res) => {
    const { id } = req.params;
    const cachedData = await client.get(`claims:${id}`);
    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }
    
    db.query('SELECT * FROM claims WHERE claim_id = ?', [id], async(err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: "Claim not found" });
        }
        await client.setEx(`claims:${id}`, 3600, JSON.stringify(result[0]));
        res.json(result[0]);
    });
});

// POST /claims
router.post('/', rateLimiter, verifyToken, claimFound.single('photo'), async (req, res) => {
    const { user_id, found_id, description, relationship } = req.body;
    const photo = req.file;

    if (!user_id || !found_id || !description || !relationship || !photo) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        const photoUrl = `uploads/claim-found-photos/${photo.filename}`;
        const status = 'pending';

        await db.query(
            `INSERT INTO claims (user_id, found_id, relationship, evidence_url, description, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, found_id, relationship, photoUrl, description, status]
        );
        // clear cache
        await client.del('claims:all');
        await client.del(`claims:${user_id}`);

        res.status(201).json({ message: 'Klaim berhasil dikirim.' });
    } catch (error) {
        console.error('Error menyimpan klaim:', error);
        res.status(500).json({ message: 'Gagal menyimpan klaim.' });
    }
});


// Update claim
router.put('/:id', rateLimiter, (req, res) => {
    const { id } = req.params;
    const { relationship, evidence_url, found_location, status } = req.body;

    // Cek apakah klaim ada sebelum diperbarui
    db.query('SELECT * FROM claims WHERE claim_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const oldData = result[0];

        console.log("Request Body:", req.body);
        console.log("Old Data:", oldData);

        // Jika data tidak dikirim dalam request, gunakan data lama
        const updatedRelationship = relationship !== undefined ? relationship : oldData.relationship;
        const updatedEvidenceUrl = evidence_url !== undefined ? evidence_url : oldData.evidence_url;
        const updatedFoundLocation = found_location !== undefined ? found_location : oldData.found_location;
        const updatedStatus = status !== undefined ? status : oldData.status;

        console.log("Updated Data:", {
            relationship: updatedRelationship,
            evidence_url: updatedEvidenceUrl,
            found_location: updatedFoundLocation,
            status: updatedStatus
        });

        db.query(
            'UPDATE claims SET relationship=?, evidence_url=?, found_location=?, status=? WHERE claim_id=?',
            [updatedRelationship, updatedEvidenceUrl, updatedFoundLocation, updatedStatus, id],
            async(err, result) => {
                if (err) return res.status(500).json({ error: 'Database update error', details: err });

                if (result.affectedRows === 0) {
                    return res.status(400).json({ error: 'No changes made to the claim' });
                }
                // clear cache
                await client.del('claims:all');
                await client.del(`claims:${id}`);

                res.json({ message: 'Claim updated successfully' });
            }
        );
    });
});

// Delete claim
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Cek apakah klaim ada sebelum menghapus
    db.query('SELECT * FROM claims WHERE claim_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        db.query('DELETE FROM claims WHERE claim_id = ?', [id], async(err, result) => {
            if (err) return res.status(500).json({ error: 'Database deletion error', details: err });
            // clear cache
            await client.del('claims:all');
            await client.del(`claims:${id}`);
            res.json({ message: 'Claim deleted successfully' });
        });
    });
});

router.get('/logs/:id', async (req, res) => {
    const id = req.params.id;
    const redisKey = `claims:${id}`;
  
    try {
      const cachedData = await client.get(redisKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
  
      const [results] = await db.query(
        'SELECT claim_id, relationship, status, created_at FROM claims WHERE user_id = ?',
        [id]
      );
  
      if (results.length === 0) {
        return res.json({ message: "You haven't reported any found person yet." });
      }
  
      await client.setEx(redisKey, 3600, JSON.stringify(results));
      res.json(results);
  
    } catch (error) {
      console.error("Error fetching claims:", error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.get('/details/:id', async (req, res) => {
    const id = req.params.id;
    const redisKey = `claims:details:${id}`;

    const query = `
      SELECT
          found_persons.found_location,
          found_persons.description,
          found_persons.status AS found_status,
          found_persons.created_at AS found_date,
          found_persons.photo_url AS found_photo_url,
          claims.relationship,
          claims.status AS claim_status,
          claims.created_at AS claim_date,
          claims.evidence_url AS claim_photo_url
      FROM claims
      LEFT JOIN found_persons ON claims.found_id = found_persons.found_id
      WHERE claims.claim_id = ?;`;
  
    try {
      const cachedData = await client.get(redisKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
  
      const [results] = await db.query(query, [id]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: "Claim not found" });
      }
  
      await client.setEx(redisKey, 3600, JSON.stringify(results[0]));
      res.json(results[0]);
  
    } catch (error) {
      console.error("Error fetching claim details:", error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
})

module.exports = router;
