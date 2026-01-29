const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { protect } = require('../controllers/auth.middleware');

router.get('/', protect, activityController.getLogs);

module.exports = router;
