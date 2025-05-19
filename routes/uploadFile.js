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
  // const refreshTokens = req.body.refreshTokens;
  const refreshTokens = req.body.refreshTokens.split(',');
  const user_id = req.body.user_id;
  const selectedEmails = req.body.selectedEmails.split(',');
  console.log('Selected emails:', selectedEmails);
  console.log('User ID:', user_id);
  console.log('Refresh tokens:', refreshTokens);
  const folderId = req.body.folderId || undefined;
  if (!refreshToken) return res.status(400).send('Missing refresh token.');
  
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
      const freeSpace  = await getDriveFreeSpace(refreshToken[0]);
      console.log('Free space:', freeSpace);
    }
    if(refreshTokens[1]!==undefined && refreshTokens[1]!==null && refreshTokens[1]!==''){
      const freeSpace  = await getDriveFreeSpace(refreshToken[1]);
      console.log('Free space:', freeSpace);
    }
    if(refreshTokens[2]!==undefined && refreshTokens[2]!==null && refreshTokens[2]!==''){
      const freeSpace  = await getDriveFreeSpace(refreshToken[2]);
      console.log('Free space:', freeSpace);
    }
    if(refreshTokens[3]!==undefined && refreshTokens[3]!==null && refreshTokens[3]!==''){
      const freeSpace  = await getDriveFreeSpace(refreshToken[3]);
      console.log('Free space:', freeSpace);
    }
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, thumbnailLink, mimeType, modifiedTime'
    });
    console.log('File uploaded:', response.data);
    const file = response.data;
    const insertQuery = `
      INSERT INTO photos (
        id, account_number, user_id, name, mime_type, modified_time, thumbnail_link, created_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      file.id,
      selectedEmails[0],
      user_id,
      file.name,
      file.mimeType,
      file.modifiedTime,
      file.thumbnailLink,
      new Date().toISOString()
    ];
  
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


/**
 * Returns the free available space in Google Drive in bytes
 * @param {string} refreshToken - OAuth2 refresh token for the user
 * @returns {Promise<number>} - Free space in bytes
 */
async function getDriveFreeSpace(refreshToken) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const about = await drive.about.get({fields: 'storageQuota'});
    const quota = about.data.storageQuota;
    if (!quota.limit) {
      throw new Error('Drive storage limit not available (might be unlimited or missing scope).');
    }
    const free = parseInt(quota.limit)-parseInt(quota.usage);
    return free;
  } catch (error) {
    console.error('❌ Failed to get Drive space:', error.message);
    throw error;
  }
}


module.exports = router;
