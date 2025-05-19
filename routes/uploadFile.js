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
  const folderId = req.body.folderId || undefined;

  try {
    const fileSize = req.file.size;
    console.log('File size:', fileSize);
    const fileMetadata = {
      name: req.file.originalname,
      parents: folderId ? [folderId] : [],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    };

    if(refreshTokens[0]!==undefined && refreshTokens[0]!==null && refreshTokens[0]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[0]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[0],user_id, selectedEmails[0], fileMetadata, media, fileSize);
        console.log('File uploaded to account 1');
        return res.status(200).json(file);
      }
    }
    if(refreshTokens[1]!==undefined && refreshTokens[1]!==null && refreshTokens[1]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[1]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[1],user_id, selectedEmails[1], fileMetadata, media, fileSize);
        console.log('File uploaded to account 2');
        return res.status(200).json(file);
      }
    }
    if(refreshTokens[2]!==undefined && refreshTokens[2]!==null && refreshTokens[2]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[2]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[2],user_id, selectedEmails[2], fileMetadata, media, fileSize);
        console.log('File uploaded to account 3');
        return res.status(200).json(file);
      }
    }
    if(refreshTokens[3]!==undefined && refreshTokens[3]!==null && refreshTokens[3]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[3]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[3],user_id, selectedEmails[3], fileMetadata, media, fileSize);
        console.log('File uploaded to account 4');
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
