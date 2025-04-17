const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path')
const multer = require('multer');

require('dotenv').config();


// Import routes
const verifyToken = require('./middleware/verifyToken');
const userRoutes = require('./routes/users');
const missingPersonRoutes = require('./routes/missingPersons');
const reportRoutes = require('./routes/reports');
const foundPersonRoutes = require('./routes/foundPersons');
const newsRoutes = require('./routes/news');
const claimRoutes = require('./routes/claims');
const notificationRoutes = require('./routes/notifications');
const passport = require('passport');
const upload = multer({ dest: 'uploads/' });

// Gunakan routes
app.use(cors());
app.use(passport.initialize());
app.use(express.json());
app.use(bodyParser.json());
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));
app.use('/auth', authRoutes);
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/users', userRoutes);
app.use('/missing-persons', missingPersonRoutes);
app.use('/reports', reportRoutes);
app.use('/news', newsRoutes);
app.use('/claims', claimRoutes);
app.use('/found-persons', foundPersonRoutes);
app.use('/notifications', notificationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
