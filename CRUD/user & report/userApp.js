const express = require('express');
const bodyParser = require('body-parser');
const usersRoutes = require('./routes/userRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routing
app.use(usersRoutes);

// Menjalankan server
app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
});