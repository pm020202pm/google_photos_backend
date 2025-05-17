const express = require('express');
const { handleSendOtp, handleLogin } = require('../controllers/auth');
const pool = require('../config/db');
const router = express.Router();

router.post('/requestotp', handleSendOtp); 
router.post('/login', handleLogin);

router.get('/user/:email', async (req, res) => {
    try{
        const email = req.params.email;
        const query = 'SELECT * FROM users WHERE email=$1';
        const result = await pool.query(query, [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({user:result.rows[0]});
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;
