const express = require('express');
const { google } = require('googleapis');
const { oauth2Client } = require('../OAuth');
const router = express.Router();

router.delete('/delete-file', async (req, res) => {
  const { fileId, refreshToken } = req.query;
  console.log('Received fileId:', fileId);


  if (!fileId || !refreshToken) {
    return res.status(400).json({ error: 'Missing fileId or accessToken' });
  }

  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    await drive.files.delete({ fileId });

    return res.status(200).json({ message: `File ${fileId} deleted successfully` });
  } catch (error) {
    console.error('❌ Error deleting file:', error.message);
    return res.status(500).json({ error: 'Failed to delete file', details: error.message });
  }
});

module.exports = router;
