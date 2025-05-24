const express = require('express');
const { google } = require('googleapis');
const { oauth2Client } = require('../OAuth');
const pool = require('../config/db');
const router = express.Router();

// router.get('/list-files', async (req, res) => {
//   const { folderId, pageToken, pageSize = 10, refreshToken } = req.query;

//   if (!refreshToken) {
//     return res.status(400).json({ error: 'Missing accessToken in query' });
//   }

//   try {
//     oauth2Client.setCredentials({ refresh_token: refreshToken });
//     console.log(oauth2Client.credentials);
//     const drive = google.drive({ version: 'v3', auth: oauth2Client });
//     console.log(folderId)
//     const query = 
//     folderId ? `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'` : `'root' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;

//     const result = await drive.files.list({
//       q: query,
//       fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, createdTime, owners(emailAddress))',
//       orderBy: 'modifiedTime desc',
//       pageToken,
//       pageSize: parseInt(pageSize),
//     });
//     res.status(200).json({
//       files: result.data.files,
//       nextPageToken: result.data.nextPageToken || null,
//     });
//   } catch (error) {
//     console.error('❌ Error listing files:', error.message);
//     res.status(500).json({ error: 'Failed to fetch files' });
//   }
// });


router.get('/list-files', async (req, res) => {
  const { folderId, pageToken, pageSize = 10, refreshToken, modifiedAfter } = req.query;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refreshToken in query' });
  }

  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // ISO date string required
    let modifiedTimeFilter = '';
    if (modifiedAfter) {
      const isoDate = new Date(modifiedAfter).toISOString(); // ensure proper format
      modifiedTimeFilter = ` and modifiedTime > '${isoDate}'`;
    }

    const query = (folderId
      ? `'${folderId}' in parents`
      : `'root' in parents`)
      + ` and trashed = false and mimeType != 'application/vnd.google-apps.folder'`
      + modifiedTimeFilter;

    const result = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime, createdTime, owners(emailAddress))',
      orderBy: 'modifiedTime desc',
      pageToken,
      pageSize: parseInt(pageSize),
    });

    res.status(200).json({
      files: result.data.files,
      nextPageToken: result.data.nextPageToken || null,
    });
  } catch (error) {
    console.error('❌ Error listing recent files:', error.message);
    res.status(500).json({ error: 'Failed to fetch recent files' });
  }
});


// router.get('/photos/:user_id', async (req, res) => {
//   try{
//     const { user_id} = req.params;
//     const {limit=20, page=1} = req.query;
//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     const query = 'SELECT * FROM photos WHERE user_id=$1 ORDER BY modified_time DESC LIMIT $2 OFFSET $3';
//     const values = [user_id, limit, offset];
//     const result = await pool.query(query, values);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'No photos found' });
//     }
//     res.status(200).json({photos:result.rows});
//   }
//   catch(err){
//     console.log(err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = router;
