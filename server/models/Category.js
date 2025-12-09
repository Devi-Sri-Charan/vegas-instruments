const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  image: String // S3 URL or external URL
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
