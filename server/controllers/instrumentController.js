// server/controllers/instrumentController.js
const Instrument = require('../models/Instrument');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function saveLocalFile(file) {
  if (!file || !file.originalname) return null;
  const safeName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
  const filepath = path.join(uploadsDir, safeName);
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${safeName}`; // relative path returned
}

// convert relative /uploads/... to absolute URL using request info
function makeAbsoluteUrl(req, relPath) {
  if (!relPath) return relPath;
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath;
  return `${req.protocol}://${req.get('host')}${relPath}`;
}

exports.createInstrument = async (req, res) => {
  try {
    const { name, categoryId, description = '', videoUrl = '', inStock = 'true' } = req.body;

    if (!name || !categoryId) return res.status(400).json({ message: 'name and categoryId are required' });

    const imageFile = req.files?.image?.[0] || null;
    const pdfFile = req.files?.pdf?.[0] || null;

    // save files if uploaded (returns relative paths)
    const imageRel = imageFile ? await saveLocalFile(imageFile) : (req.body.image || '');
    const pdfRel = pdfFile ? await saveLocalFile(pdfFile) : (req.body.pdf || '');

    // convert to absolute URLs for API consumers
    const imageUrl = imageRel ? makeAbsoluteUrl(req, imageRel) : '';
    const pdfUrl = pdfRel ? makeAbsoluteUrl(req, pdfRel) : '';

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
    const imageFile = req.files?.image?.[0] || null;
    const pdfFile = req.files?.pdf?.[0] || null;

    // IMAGE handling (existing logic)
    if (imageFile) {
      const imageRel = await saveLocalFile(imageFile);
      if (imageRel) existing.image = makeAbsoluteUrl(req, imageRel);
    } else if (req.body.image) {
      existing.image = req.body.image.startsWith('http') ? req.body.image : makeAbsoluteUrl(req, req.body.image);
    }

    // PDF handling:
    // - If pdfRemove === 'true' => remove stored PDF (set to empty)
    // - Else if a new pdf file uploaded => replace with new uploaded file
    // - Else if req.body.pdf (a URL) provided => set to that
    if (pdfRemove === 'true') {
      existing.pdf = '';
    } else if (pdfFile) {
      const pdfRel = await saveLocalFile(pdfFile);
      if (pdfRel) existing.pdf = makeAbsoluteUrl(req, pdfRel);
    } else if (req.body.pdf) {
      existing.pdf = req.body.pdf.startsWith('http') ? req.body.pdf : makeAbsoluteUrl(req, req.body.pdf);
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

// server/controllers/instrumentController.js
exports.deleteInstrument = async (req, res) => {
  try {
    const id = req.params.id;

    // Attempt a direct delete (atomic and safe)
    const deleted = await Instrument.findByIdAndDelete(id);

    // If nothing was deleted, instrument not found
    if (!deleted) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    // Optionally: if you saved files to disk and want to remove them,
    // you can remove physical files here using `deleted.image` / `deleted.pdf`
    // (be careful and only delete files that are local and referenced by relative paths)
    //
    // Example (uncomment to enable local-file deletion):
    // const fs = require('fs');
    // const path = require('path');
    // if (deleted.image && deleted.image.includes('/uploads/')) {
    //   const filename = deleted.image.split('/').pop();
    //   const filePath = path.join(__dirname, '..', 'uploads', filename);
    //   if (fs.existsSync(filePath)) try { fs.unlinkSync(filePath); } catch(e){ console.warn('Could not delete image file', e); }
    // }
    // if (deleted.pdf && deleted.pdf.includes('/uploads/')) {
    //   const filename = deleted.pdf.split('/').pop();
    //   const filePath = path.join(__dirname, '..', 'uploads', filename);
    //   if (fs.existsSync(filePath)) try { fs.unlinkSync(filePath); } catch(e){ console.warn('Could not delete pdf file', e); }
    // }

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
    const items = await Instrument.find(q).populate('categoryId').skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
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
    const items = await Instrument.find().populate('categoryId').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching instruments' });
  }
};
