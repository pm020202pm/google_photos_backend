const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');
const { oauth2Client } = require('../OAuth');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(400).send('Missing refresh token.');
  const folderId = req.body.folderId || undefined;
  try {
    // Set refresh token
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: req.file.originalname,
      parents: folderId ? [folderId] : [],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, thumbnailLink, mimeType, modifiedTime'
    });
    console.log('File uploaded:', response.data);
  
    res.status(200).json({
      message: '✅ File uploaded to user\'s Google Drive',
      id: response.data.id,
      name: response.data.name,
      fileUrl: response.data.webViewLink,
      thumbnailLink: response.data.thumbnailLink,
      mimeType: response.data.mimeType,
      modifiedTime: response.data.modifiedTime,
    });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).send('Upload failed: ' + error.message);
  }
});

module.exports = router;
