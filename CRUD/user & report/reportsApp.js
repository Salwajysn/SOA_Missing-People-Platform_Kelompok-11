const express = require('express');
const bodyParser = require('body-parser');
const reportsRoutes = require('./routes/reportsRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routing
app.use(reportsRoutes);

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
});