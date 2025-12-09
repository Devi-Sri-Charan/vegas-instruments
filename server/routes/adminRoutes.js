const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/init', adminController.registerIfNot);
router.post('/login', adminController.login);

module.exports = router;
