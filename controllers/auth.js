const { sendOtp, verifyOtp } = require('../models/auth');
const pool = require('../config/db');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;


const handleSendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        await sendOtp(email);
        res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error('Error in sending OTP:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const handleLogin = async (req, res) => {
    const { email, otp, name=''} = req.body;
    if (!email || !otp ) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }
    try {
        const isValid = await verifyOtp(email, otp);
        if (isValid) {
            const photo_url = getPhotoUrl(email);
            const token = jwt.sign({ email: email }, secretKey);
            const query1 = 'SELECT * FROM users WHERE email=$1';
            const result1 = await pool.query(query1, [email]);
            if (result1.rows.length > 0) {
                return res.status(200).json({ message: 'User already exists', user: result1.rows[0], token:token });
            }
            const query2 = `INSERT INTO users (email, name, photo_url) VALUES ($1, $2, $3) RETURNING *`;
            const result2 = await pool.query(query2, [email, name, photo_url]);
            const user = result2.rows[0];
            res.status(201).json({  message: 'User registered successully', user: user, token:token });
        } else {
            res.status(402).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error in registering:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getPhotoUrl = (emailId)=>{
    const url = `https://firebasestorage.googleapis.com/v0/b/traveldost-f6a2d.appspot.com/o/images%2F${emailId}?alt=media`;
    return url;
}

module.exports = { handleSendOtp, handleLogin, getPhotoUrl };