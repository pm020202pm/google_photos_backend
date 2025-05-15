import { google } from 'googleapis';
import { auth, drive1FolderId } from './auth.js'; // assuming you have auth.js in the same directory

async function createFolder(folderName, parentFolderId = null) {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] }), // optional parent folder
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });

    console.log(`✅ Folder "${response.data.name}" created with ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('❌ Error creating folder:', error.message);
    return null;
  }
}

await createFolder('MyNewFolder', drive1FolderId);

