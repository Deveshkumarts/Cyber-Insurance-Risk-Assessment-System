require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const insuranceRoutes = require('./routes/insuranceRoutes');

const claimRoutes = require('./routes/claimRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', apiRoutes);
app.use('/api', insuranceRoutes);
app.use('/api', require('./routes/incidentRoutes'));
app.use('/api', require('./routes/organizationRoutes'));
app.use('/api', claimRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Health Check
app.get('/', (req, res) => {
    res.send('CRAP Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
