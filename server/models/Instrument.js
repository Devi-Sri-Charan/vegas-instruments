// server/models/Instrument.js
const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({ key: String, value: String }, { _id: false });

const instrumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  specifications: { type: [specSchema], default: [] },
  image: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  pdf: { type: String, default: '' },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Instrument', instrumentSchema);
