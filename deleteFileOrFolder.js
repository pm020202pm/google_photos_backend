// const { auth } = require("./auth");
import {auth} from "./auth.js";
import { google } from 'googleapis';
async function deleteFile(fileId) {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  try {
    await drive.files.delete({
      fileId: fileId,
    });
    console.log(`✅ File with ID ${fileId} has been deleted successfully.`);
  } catch (error) {
    console.error(`❌ Error deleting file with ID ${fileId}:`, error.message);
  }
}


const fileIdToDelete = '15Hdca9R0bcVEGqYSMXrOQi91nelWgCfI';
await deleteFile(fileIdToDelete);
