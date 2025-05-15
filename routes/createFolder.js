const express = require('express');
const { google } = require('googleapis');
const { auth } = require('../auth');
const router = express.Router();

router.post('/create-folder', async (req, res) => {
  const { folderName, parentFolderId } = req.body;

  if (!folderName) {
    return res.status(400).json({ error: 'folderName is required' });
  }

  try {
    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    res.status(201).json({
      message: '📂 Folder created successfully',
      folderId: folder.data.id,
      folderName: folder.data.name,
    });
  } catch (error) {
    console.error('❌ Error creating folder:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;