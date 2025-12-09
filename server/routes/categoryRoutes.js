// server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', categoryController.listCategories);
router.post('/', upload.fields([{ name: 'image' }]), categoryController.createCategory);
router.put('/:id', upload.fields([{ name: 'image' }]), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
