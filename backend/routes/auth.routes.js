const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, admin } = require('../controllers/auth.middleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/pending-nurses', protect, admin, authController.getPendingNurses);
router.patch('/approve/:id', protect, admin, authController.approveNurse);

module.exports = router;
