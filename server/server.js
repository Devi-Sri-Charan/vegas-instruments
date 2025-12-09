// server/app.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve local uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
const instrumentRoutes = require('./routes/instrumentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes'); // if you have this

app.use('/api/instruments', instrumentRoutes);
app.use('/api/categories', categoryRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Vega Instruments API (local uploads)'));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('DB connect error', err);
  });
