// server/routes/instrumentRoutes.js
const express = require('express');
const router = express.Router();
const instrumentController = require('../controllers/instrumentController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// public
router.get('/', instrumentController.listPublic);
router.get('/:id', instrumentController.getInstrument);

// admin / protected (ensure auth middleware applied where you mount these routes)
router.get('/admin/list/all', instrumentController.adminListAll);
router.post('/', upload.fields([{ name: 'image' }, { name: 'pdf' }]), instrumentController.createInstrument);
router.put('/:id', upload.fields([{ name: 'image' }, { name: 'pdf' }]), instrumentController.updateInstrument);
router.delete('/:id', instrumentController.deleteInstrument);

module.exports = router;
