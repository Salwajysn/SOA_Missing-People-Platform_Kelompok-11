const express = require('express');
const { uploadFound } = require('../middleware/upload');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();
const db = require('../db');
const client = require('../client');
const rateLimiter = require('../middleware/rateLimiting');
const throttling = require('../middleware/throttling');

// Get all found persons
router.get('/', throttling, async (req, res) => {
    try {
      const cachedData = await client.get('found_persons');
        
      if (cachedData) {
          return res.json(JSON.parse(cachedData));
      }

      const [rows] = await db.query('SELECT * FROM found_persons')
      await client.setEx('found_persons:all', 3600, JSON.stringify(rows));
      res.json(rows);
    } catch (error) {
      console.error('Error fetching found persons:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get found person by ID (with async/await)
router.get('/:id', throttling, async (req, res) => {
  const { id } = req.params;

  try {
    const cachedData = await client.get(`found_persons:${id}`);
    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }
    const [rows] = await db.query('SELECT * FROM found_persons WHERE found_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    await client.setEx(`found_persons:${id}`, 3600, JSON.stringify(rows[0]));
    res.json(rows[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error', details: err });
  }
});

// Create new found person in reports page
router.post('/', rateLimiter, verifyToken, uploadFound.single('photo_url'), async (req, res) => {
  console.log("Isi req.user =>", req.user); // DEBUG
    const { 
      found_location, found_date, description 
    } = req.body;

    const photoPath = req.file ? req.file.path : null;
    const userId = req.user.user_id; 
  
    try {
      await db.query(`
        INSERT INTO found_persons 
        (user_id, found_location, found_date, description, photo_url)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, found_location, found_date, description, photoPath]);
       // Clear cache
       await client.del('found_persons:all');
       await client.del(`found_persons:${userId}`);
  
      res.status(201).json({ message: 'Found person report submitted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error while creating report.' });
    }
  });


// Update found person status
router.put('/:id', rateLimiter, (req, res) => {
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
            async(err, result) => {
                if (err) return res.status(500).json({error: 'Database update error', details: err});
                if(result.affectedRows === 0){
                    return res.status(404).json({error: 'No change made to the found persons'});
                }
                 // Clear cache
                await client.del('found_persons:all');
                await client.del(`found_persons:${userId}`);
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

    db.query('DELETE FROM found_persons WHERE found_id = ?', [id], async(err, result) => {
        if (err) return res.status(500).json({ error: 'Database deletion error', details: err });
         // Clear cache
         await client.del('found_persons:all');
         await client.del(`found_persons:${userId}`);
        res.json({ message: 'Found person record deleted successfully' });
         });
    });
});

router.get('/logs/:id', async (req, res) => {
  const id = req.params.id;
  const redisKey = `found_persons:${id}`;

  try {
      // Cek cache Redis
      const cachedData = await client.get(redisKey);
      if (cachedData) {
          return res.json(JSON.parse(cachedData));
      }

      // Query ke database
      const [results] = await db.query(
          'SELECT found_id, found_location, status, created_at FROM found_persons WHERE user_id = ?',
          [id]
      );

      if (results.length === 0) {
          return res.json({ message: "You haven't reported any found person yet." });
      }

      // Simpan ke Redis dan kirim respons
      await client.setEx(redisKey, 3600, JSON.stringify(results));
      res.json(results);

  } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/details/:id', throttling, async (req, res) => {
  const id = req.params.id;
  const redisKey = `found_person_detail:${id}`;

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
      FROM found_persons
      LEFT JOIN claims ON found_persons.found_id = claims.found_id
      WHERE found_persons.found_id = ?;
  `;

  try {
      const cachedData = await client.get(redisKey);
      if (cachedData) {
          return res.json(JSON.parse(cachedData));
      }

      // Query ke database
      const [results] = await db.query(query, [id]);

      if (results.length === 0) {
          return res.status(404).json({ message: "Found person not found." });
      }

      // Simpan ke Redis dan kirim respons
      await client.setEx(redisKey, 3600, JSON.stringify(results[0]));

      res.json(results[0]);

  } catch (error) {
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
})

module.exports = router;
