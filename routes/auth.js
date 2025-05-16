const express = require('express');
const { handleSendOtp, checkUserExistence, handleLogin } = require('../controllers/auth');
const router = express.Router();

router.post('/requestotp', handleSendOtp); 
router.get('/isUserExist', checkUserExistence);
router.post('/login', handleLogin);

module.exports = router;
