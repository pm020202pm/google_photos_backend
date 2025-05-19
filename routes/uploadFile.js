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
    const fileSize = req.file.size; // ⬅️ File size in bytes
    // Set refresh token
    const refreshToken1 = refreshTokens[0];
    const refreshToken2 = refreshTokens[1];
    const refreshToken3 = refreshTokens[2];
    const refreshToken4 = refreshTokens[3];
    console.log('Refresh token 1:', refreshToken1);
    console.log('Refresh token 2:', refreshToken2);
    console.log('Refresh token 3:', refreshToken3);
    console.log('Refresh token 4:', refreshToken4);
    if(refreshTokens[0]!==undefined && refreshTokens[0]!==null && refreshTokens[0]!==''){
      oauth2Client.setCredentials({ refresh_token: refreshToken1 });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const about = await drive.about.get({fields: 'storageQuota'});
      const quota = about.data.storageQuota;
      if (!quota.limit) {
        throw new Error('Drive storage limit not available (might be unlimited or missing scope).');
      }
      const free =  parseInt(quota.limit) - parseInt(quota.usage);
      console.log('Free space:', free);
    }
    if(refreshTokens[1]!==undefined && refreshTokens[1]!==null && refreshTokens[1]!==''){
      oauth2Client.setCredentials({ refresh_token: refreshToken2 });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const about = await drive.about.get({fields: 'storageQuota'});
      const quota = about.data.storageQuota;
      if (!quota.limit) {
        throw new Error('Drive storage limit not available (might be unlimited or missing scope).');
      }
      const free =  parseInt(quota.limit) - parseInt(quota.usage);
      console.log('Free space:', free);
    }
    if(refreshTokens[2]!==undefined && refreshTokens[2]!==null && refreshTokens[2]!==''){
      console.log('No refresh token found for user:', 3);
      // return res.status(400).send('No refresh token found for user.');
    }
    if(refreshTokens[3]!==undefined && refreshTokens[3]!==null && refreshTokens[3]!==''){
      console.log('No refresh token found for user:', 4);
      // return res.status(400).send('No refresh token found for user.');
    }
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    // checking storage quota
    const about = await drive.about.get({fields: 'storageQuota'});
    const quota = about.data.storageQuota;
    if (!quota.limit) {
      throw new Error('Drive storage limit not available (might be unlimited or missing scope).');
    }
    const free =  parseInt(quota.limit) - parseInt(quota.usage);
    console.log('Free space:', free);
    console.log('File size:', fileSize);

    //////////////////////////////////

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
    const file = response.data;
    // const insertQuery = `
    //   INSERT INTO photos (
    //     id, account_number, user_id, name, mime_type, modified_time, thumbnail_link, created_time
    //   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    // `;
    // const values = [
    //   file.id,
    //   selectedEmail,
    //   user_id,
    //   file.name,
    //   file.mimeType,
    //   file.modifiedTime,
    //   file.thumbnailLink,
    //   new Date().toISOString()
    // ];
  
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
