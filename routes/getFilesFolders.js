const express = require('express');
const { google } = require('googleapis');
const { oauth2Client } = require('../OAuth');
const router = express.Router();

router.get('/list-files', async (req, res) => {
  const { folderId, pageToken, pageSize = 10, refreshToken } = req.query;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing accessToken in query' });
  }

  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    console.log(oauth2Client.credentials);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const query = folderId
      ? `'${folderId}' in parents and trashed = false`
      : `'root' in parents and trashed = false`;

    const result = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, modifiedTime)',
      pageToken,
      pageSize: parseInt(pageSize),
    });

    console.log('Files listed:', result.data.files);

    res.status(200).json({
      files: result.data.files,
      nextPageToken: result.data.nextPageToken || null,
    });
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

module.exports = router;
