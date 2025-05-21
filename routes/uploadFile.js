const express = require('express');
const multer = require('multer');
const { Readable } = require('stream');
const { getDriveFreeSpace } = require('../getFreeSpace');
const { uploadFileToDrive } = require('../uploadFileToDrive');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const refreshTokens = req.body.refreshTokens.split(',');
  const user_id = req.body.user_id;
  const selectedEmails = req.body.selectedEmails.split(',');
  try {
    const fileSize = req.file.size;
    console.log('File size:', fileSize);
    const fileMetadata = {
      name: req.file.originalname,
      parents: []
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    };
    for(let i=0; i<refreshTokens.length; i++){
      const freeSpace = await getDriveFreeSpace(refreshTokens[i]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[i],user_id, selectedEmails[i], fileMetadata, media, fileSize);
        console.log(`File uploaded to ${selectedEmails[i]}`);
        return res.status(200).json(file);
      }
    }
    return res.status(400).json({ error: 'Not enough free space in all accounts' });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).send('Upload failed: ' + error.message);
  }
});



module.exports = router;
