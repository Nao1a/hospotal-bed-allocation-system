const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bed.controller');
const { protect, admin } = require('../controllers/auth.middleware');

router.post('/', protect, admin, bedController.addBed);
router.get('/', bedController.getAllBeds);
router.patch('/:bedId/status', bedController.updateBedStatus);

module.exports = router;
