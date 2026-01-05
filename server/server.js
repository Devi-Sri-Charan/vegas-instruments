// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: No need to serve /uploads folder anymore - using S3!
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
const instrumentRoutes = require('./routes/instrumentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/instruments', instrumentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Vega Instruments API (AWS S3 uploads)'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    storage: 'AWS S3',
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('MongoDB connected');
    console.log('Using AWS S3 for file storage');
    console.log(`S3 Bucket: ${process.env.AWS_S3_BUCKET || 'NOT CONFIGURED'}`);
    console.log(`AWS Region: ${process.env.AWS_REGION || 'NOT CONFIGURED'}`);
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connect error', err);
    process.exit(1);
  });