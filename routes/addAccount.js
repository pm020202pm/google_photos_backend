const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/addAccount', async (req, res) => {
    const { email, accountNo, user_id, folderId} = req.body;
    console.log(email, accountNo);
    if (!email || !accountNo) {
        return res.status(400).json({ error: 'Email and account number are required' });
    }
    try {
        const query = `UPDATE users SET ${accountNo} = $1 ${folderId ? ', shared_folder_id = $3' : ''} WHERE user_id = $2 RETURNING *;`;
        const values = folderId ? [email, user_id, folderId] : [email, user_id];
        const result = await pool.query(query, values);
        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(201).json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;
