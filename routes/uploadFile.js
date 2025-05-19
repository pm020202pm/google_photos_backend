const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');
const { oauth2Client } = require('../OAuth');
const { getDriveFreeSpace } = require('../getFreeSpace');
const { uploadFileToDrive } = require('../uploadFileToDrive');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  const refreshTokens = req.body.refreshTokens.split(',');
  const user_id = req.body.user_id;
  const selectedEmails = req.body.selectedEmails.split(',');
  console.log('Selected emails:', selectedEmails);
  console.log('User ID:', user_id);
  console.log('Refresh tokens:', refreshTokens);
  const folderId = req.body.folderId || undefined;

  try {
    const fileSize = req.file.size;
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
        const file = await uploadFileToDrive(refreshTokens[0],user_id, selectedEmails[0], fileMetadata, media);
        console.log('File uploaded to account 1');
        return res.status(200).json({file})
      }
    }
    if(refreshTokens[1]!==undefined && refreshTokens[1]!==null && refreshTokens[1]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[1]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[1],user_id, selectedEmails[1], fileMetadata, media);
        console.log('File uploaded to account 2');
        return res.status(200).json({file})
      }
    }
    if(refreshTokens[2]!==undefined && refreshTokens[2]!==null && refreshTokens[2]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[2]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[2],user_id, selectedEmails[2], fileMetadata, media);
        console.log('File uploaded to account 3');
        return res.status(200).json({file})
      }
    }
    if(refreshTokens[3]!==undefined && refreshTokens[3]!==null && refreshTokens[3]!==''){
      const freeSpace = await getDriveFreeSpace(refreshTokens[3]);
      if(freeSpace >fileSize) {
        const file = await uploadFileToDrive(refreshTokens[3],user_id, selectedEmails[3], fileMetadata, media);
        console.log('File uploaded to account 4');
        return res.status(200).json({file})
      }
    }
    return res.status(400).send('No account has enough space to upload the file.');

    // res.status(200).json({
    //   message: '✅ File uploaded to user\'s Google Drive',
    //   id: response.data.id,
    //   name: response.data.name,
    //   fileUrl: response.data.webViewLink,
    //   thumbnailLink: response.data.thumbnailLink,
    //   mimeType: response.data.mimeType,
    //   modifiedTime: response.data.modifiedTime,
    // });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).send('Upload failed: ' + error.message);
  }
});



module.exports = router;
