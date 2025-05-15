const fs = require('fs');
const { drive2FolderId, auth } = require('./auth');
const { google } = require('googleapis');
const mime = require('mime-types');


// Load service account key

// Upload function
async function uploadFile(filePath, folderId) {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  const fileName = filePath.split('/').pop();

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mime.lookup(filePath) || 'application/octet-stream',
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });

  console.log(`✅ Uploaded: ${fileName}, File ID: ${response.data.id}`);
}

// Folder IDs (from Google Drive URL of shared folders)


// Example: pick folder manually
const useDrive1 = false;

const filePath = 'd.exe';
uploadFile(filePath, drive2FolderId);
