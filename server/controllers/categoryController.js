// server/controllers/categoryController.js
const Instrument = require('../models/Instrument');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function saveLocalFile(file) {
  if (!file || !file.originalname) return null;
  const safeName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
  const filepath = path.join(uploadsDir, safeName);
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${safeName}`;
}

function makeAbsoluteUrl(req, relPath) {
  if (!relPath) return relPath;
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath;
  return `${req.protocol}://${req.get('host')}${relPath}`;
}

exports.createCategory = async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const imageFile = req.files?.image?.[0] || null;
    const imageRel = imageFile ? await saveLocalFile(imageFile) : (req.body.image || '');
    const imageUrl = imageRel ? makeAbsoluteUrl(req, imageRel) : '';

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
    const imageFile = req.files?.image?.[0] || null;

    if (imageFile) {
      const imageRel = await saveLocalFile(imageFile);
      if (imageRel) cat.image = makeAbsoluteUrl(req, imageRel);
    } else if (req.body.image) {
      cat.image = req.body.image.startsWith('http') ? req.body.image : makeAbsoluteUrl(req, req.body.image);
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

// server/controllers/categoryController.js
// server/controllers/categoryController.js
exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    // Delete the category document
    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Option A (recommended): keep instruments but clear their categoryId
    // This prevents orphaned references from causing errors in queries that expect a categoryId.
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
