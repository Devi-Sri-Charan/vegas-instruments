// server/controllers/categoryController.js
const Category = require('../models/Category');
const Instrument = require('../models/Instrument');
const { uploadBuffer } = require('../s3');

exports.createCategory = async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    let imageUrl = req.body.image || '';
    
    // If image file uploaded, upload to S3
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      try {
        imageUrl = await uploadBuffer(
          imageFile.buffer, 
          imageFile.originalname, 
          imageFile.mimetype,
          'categories'
        );
      } catch (err) {
        console.error('S3 upload error:', err);
        return res.status(500).json({ message: 'Failed to upload image to S3' });
      }
    }

    const cat = new Category({ name, description, image: imageUrl });
    await cat.save();
    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const { name, description } = req.body;
    const imageFile = req.files?.image?.[0];

    // If new image file uploaded, upload to S3
    if (imageFile) {
      try {
        const imageUrl = await uploadBuffer(
          imageFile.buffer, 
          imageFile.originalname, 
          imageFile.mimetype,
          'categories'
        );
        cat.image = imageUrl;
      } catch (err) {
        console.error('S3 upload error:', err);
        return res.status(500).json({ message: 'Failed to upload image to S3' });
      }
    } else if (req.body.image) {
      // If image URL provided in body
      cat.image = req.body.image;
    }

    if (name !== undefined) cat.name = name;
    if (description !== undefined) cat.description = description;

    await cat.save();
    res.json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    // Delete the category document
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Clear categoryId from instruments to prevent orphaned references
    await Instrument.updateMany(
      { categoryId: id },
      { $set: { categoryId: null } }
    );

    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};