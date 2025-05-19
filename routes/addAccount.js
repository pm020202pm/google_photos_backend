const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/addAccount', async (req, res) => {
    const { email, accountNo} = req.body;
    console.log(email, accountNo);
    if (!email) {
        return res.status(400).json({ error: 'Email and account number are required' });
    }
    if (accountNo!=='account1' || accountNo!=='account2' || accountNo!=='account3' || accountNo!=='account4') {
        return res.status(400).json({ error: 'Account number is required' });
    }
    const query = `INSERT INTO users (${accountNo}) VALUES ($1) RETURNING *`;
    try {
        const result = await pool.query(query, [email]);
        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;
