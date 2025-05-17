const express = require('express');
const { handleSendOtp, handleLogin } = require('../controllers/auth');
const router = express.Router();

router.post('/requestotp', handleSendOtp); 
router.post('/login', handleLogin);

module.exports = router;
