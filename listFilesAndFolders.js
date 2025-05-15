
import { google } from 'googleapis';
import { auth, drive1FolderId, drive2FolderId } from './auth.js'; // assuming you have auth.js in the same directory

async function listFolderContents(folderId) {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  const files = [];
  let pageToken = null;

  try {
    do {
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink)',
        spaces: 'drive',
        pageToken: pageToken,
      });

      files.push(...res.data.files);
      pageToken = res.data.nextPageToken;
    } while (pageToken);

    console.log(`📁 Contents of folder (${folderId}):`);
    for (const file of files) {
      const type = file.mimeType === 'application/vnd.google-apps.folder' ? '📂 Folder' : '📄 File';
      console.log(`${type}: ${file.name} (${file.id})`);
    }

    return files;
  } catch (error) {
    console.error('❌ Error listing folder contents:', error.message);
    return [];
  }
}


const folderId = '1aBcD3EfGHiJKLmNoPQrsTUVwXyZ';
const contents = await listFolderContents(drive1FolderId);
console.log('Contents:', contents);