const express = require('express');
const router = express.Router();
const db = require('../db');
const client = require('../client');

// Get all reports
router.get('/', (req, res) => {
    const cachedData = client.get('reports:all');
    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }
    db.query('SELECT * FROM reports', async(err, results) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        await client.setEx('reports:all', 3600, JSON.stringify(results));
        res.json(results);
    });
});

// Get report by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const cachedData = client.get(`reports:${id}`);
    if (cachedData) {
        return res.json(JSON.parse(cachedData));
    }
    db.query('SELECT * FROM reports WHERE report_id = ?', [id],async (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }
        await client.setEx(`reports:${id}`, 3600, JSON.stringify(result[0]));
        res.json(result[0]);
    });
});

// Create new report
router.post('/', (req, res) => {
    const { user_id, missing_id, description, report_date, status } = req.body;
    
    if (!user_id || !missing_id || !description || !report_date || !status){
        return res.status(404).json({error: "All field are required"})
    }
    
    db.query('INSERT INTO reports (user_id, missing_id, description, report_date, status) VALUES (?, ?, ?, ?, ?)',
        [user_id, missing_id, description, report_date, status],
        async(err, result) => {
            if (err) return res.status(500).json({ error: 'Database insertion error', details: err });

            // clear cache
            await client.del('reports:all'); 
            await client.del(`reports:${user_id}`); 
            res.json({ message: 'Report created successfully', reportId: result.insertId });
        });
});

// Update report
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { description, status } = req.body;

    // Cek apakah report ada sebelum melakukan update
    db.query('SELECT * FROM reports WHERE report_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const oldData = result[0];

        console.log("Request Body:", req.body);
        console.log("Old Data:", oldData);

        // Jika data tidak dikirim dalam request, gunakan data lama
        const updatedDescription = description !== undefined ? description : oldData.description;
        const updatedStatus = status !== undefined ? status : oldData.status;

        console.log("Updated Data:", {
            description: updatedDescription,
            status: updatedStatus
        });

        db.query(
            'UPDATE reports SET description=?, status=? WHERE report_id=?',
            [updatedDescription, updatedStatus, id],
            async (err, result) => {
                if (err) return res.status(500).json({ error: 'Database update error', details: err });

                if (result.affectedRows === 0) {
                    return res.status(400).json({ error: 'No changes made to the report' });
                }

                            // clear cache
                await client.del('reports:all'); 
                await client.del(`reports:${id}`); 

                res.json({ message: 'Report updated successfully' });
            }
        );
    });
});

// Delete report
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // Cek apakah report ada sebelum menghapus
    db.query('SELECT * FROM reports WHERE report_id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database query error', details: err });
        if (result.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        db.query('DELETE FROM reports WHERE report_id = ?', [id], async(err, result) => {
            if (err) return res.status(500).json({ error: 'Database deletion error', details: err });
            // clear cache
            await client.del('reports:all'); 
            await client.del(`reports:${id}`); 
            res.json({ message: 'Report deleted successfully' });
        });
    });
});

router.get('/logs/:id', async (req, res) => {
    const id = req.params.id;
    const redisKey = `reports:${id}`;
  
    try {
      const cachedData = await client.get(redisKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
  
      const [results] = await db.query(
        'SELECT report_id, description, status, report_date FROM reports WHERE user_id = ?',
        [id]
      );
  
      if (results.length === 0) {
        return res.json({ message: "You haven't submitted any report of missing person yet." });
      }
  
      await client.setEx(redisKey, 3600, JSON.stringify(results));
      res.json(results);
  
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });

  router.get('/details/:id', async (req, res) => {
    const id = req.params.id;
    const redisKey = `report_detail:${id}`;

    const query = `
        SELECT
            missing_persons.full_name,
            missing_persons.age,
            missing_persons.gender,
            missing_persons.height,
            missing_persons.weight,
            missing_persons.last_seen_location,
            missing_persons.last_seen_date,
            missing_persons.photo_url,
            missing_persons.status AS missing_status,
            missing_persons.created_at,
            reports.description,
            reports.report_date,
            reports.status AS report_status
        FROM reports
        LEFT JOIN missing_persons ON reports.missing_id = missing_persons.missing_id
        WHERE report_id = ?`;

    try {
        const cachedData = await client.get(redisKey);
        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        const [results] = await db.query(query, [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        await client.setEx(redisKey, 3600, JSON.stringify(results[0]));
        res.json(results[0]);

    } catch (error) {
        console.error('Error fetching report details:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
})

  

module.exports = router;
