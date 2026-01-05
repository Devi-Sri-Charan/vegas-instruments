// server/controllers/instrumentController.js
const Instrument = require('../models/Instrument');
const { uploadBuffer } = require('../s3');

exports.createInstrument = async (req, res) => {
  try {
    const { name, categoryId, description = '', videoUrl = '', inStock = 'true' } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: 'name and categoryId are required' });
    }

    const imageFile = req.files?.image?.[0];
    const pdfFile = req.files?.pdf?.[0];

    let imageUrl = req.body.image || '';
    let pdfUrl = req.body.pdf || '';

    // Upload image to S3 if provided
    if (imageFile) {
      try {
        imageUrl = await uploadBuffer(
          imageFile.buffer, 
          imageFile.originalname, 
          imageFile.mimetype,
          'instruments/images'
        );
      } catch (err) {
        console.error('S3 image upload error:', err);
        return res.status(500).json({ message: 'Failed to upload image to S3' });
      }
    }

    // Upload PDF to S3 if provided
    if (pdfFile) {
      try {
        pdfUrl = await uploadBuffer(
          pdfFile.buffer, 
          pdfFile.originalname, 
          pdfFile.mimetype,
          'instruments/pdfs'
        );
      } catch (err) {
        console.error('S3 PDF upload error:', err);
        return res.status(500).json({ message: 'Failed to upload PDF to S3' });
      }
    }

    const inst = new Instrument({
      name,
      categoryId,
      description,
      videoUrl,
      image: imageUrl,
      pdf: pdfUrl,
      inStock: (inStock === 'true' || inStock === true)
    });

    await inst.save();
    const populated = await Instrument.findById(inst._id).populate('categoryId');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error creating instrument' });
  }
};

exports.updateInstrument = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Instrument.findById(id);
    if (!existing) return res.status(404).json({ message: 'Instrument not found' });

    const { name, categoryId, description, videoUrl, inStock, pdfRemove } = req.body;
    const imageFile = req.files?.image?.[0];
    const pdfFile = req.files?.pdf?.[0];

    // Handle IMAGE upload
    if (imageFile) {
      try {
        const imageUrl = await uploadBuffer(
          imageFile.buffer, 
          imageFile.originalname, 
          imageFile.mimetype,
          'instruments/images'
        );
        existing.image = imageUrl;
      } catch (err) {
        console.error('S3 image upload error:', err);
        return res.status(500).json({ message: 'Failed to upload image to S3' });
      }
    } else if (req.body.image) {
      existing.image = req.body.image;
    }

    // Handle PDF upload/removal
    if (pdfRemove === 'true') {
      existing.pdf = '';
    } else if (pdfFile) {
      try {
        const pdfUrl = await uploadBuffer(
          pdfFile.buffer, 
          pdfFile.originalname, 
          pdfFile.mimetype,
          'instruments/pdfs'
        );
        existing.pdf = pdfUrl;
      } catch (err) {
        console.error('S3 PDF upload error:', err);
        return res.status(500).json({ message: 'Failed to upload PDF to S3' });
      }
    } else if (req.body.pdf) {
      existing.pdf = req.body.pdf;
    }

    if (name !== undefined) existing.name = name;
    if (categoryId !== undefined) existing.categoryId = categoryId;
    if (description !== undefined) existing.description = description;
    if (videoUrl !== undefined) existing.videoUrl = videoUrl;
    if (inStock !== undefined) existing.inStock = (inStock === 'true' || inStock === true);

    await existing.save();
    const populated = await Instrument.findById(existing._id).populate('categoryId');
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error updating instrument' });
  }
};

exports.deleteInstrument = async (req, res) => {
  try {
    const id = req.params.id;

    // Attempt a direct delete (atomic and safe)
    const deleted = await Instrument.findByIdAndDelete(id);

    // If nothing was deleted, instrument not found
    if (!deleted) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    // Note: In production, you might want to delete S3 files here
    // using DeleteObjectCommand from @aws-sdk/client-s3

    res.json({ message: 'Instrument deleted' });
  } catch (err) {
    console.error('deleteInstrument error:', err);
    res.status(500).json({ message: 'Error deleting instrument' });
  }
};

exports.listPublic = async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const q = { inStock: true };
    if (category) q.categoryId = category;
    
    const total = await Instrument.countDocuments(q);
    const items = await Instrument.find(q)
      .populate('categoryId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
      
    res.json({ 
      items, 
      total, 
      page: parseInt(page), 
      pages: Math.ceil(total / limit) 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching instruments' });
  }
};

exports.getInstrument = async (req, res) => {
  try {
    const id = req.params.id;
    const inst = await Instrument.findById(id).populate('categoryId');
    if (!inst) return res.status(404).json({ message: 'Instrument not found' });
    if (!inst.inStock) return res.status(404).json({ message: 'Instrument not available' });
    res.json(inst);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching instrument' });
  }
};

exports.adminListAll = async (req, res) => {
  try {
    const items = await Instrument.find()
      .populate('categoryId')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching instruments' });
  }
};