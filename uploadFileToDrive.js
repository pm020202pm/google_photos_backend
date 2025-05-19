

const { google } = require('googleapis');
const { oauth2Client } = require('./OAuth');
const pool = require('./config/db');

/**
 * Uploads a file to Google Drive using the user's refresh token.
 * @param {string} refreshToken - The user's refresh token
 * @param {Object} fileMetadata - Metadata for the file (e.g., name, parents)
 * @param {Object} media - File media (e.g., mimeType, body)
 * @returns {Promise<Object>} - Google Drive file response
 */
async function uploadFileToDrive(refreshToken, fileMetadata, media) {
  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, thumbnailLink, mimeType, modifiedTime'
    });

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
    // const result = await pool.query(insertQuery, values);
    // if (result.rowCount === 0) {
    //   throw new Error('Failed to insert file metadata into database');
    // }
    return response.data;
  } catch (error) {
    console.error('❌ Google Drive upload error:', error.message);
    throw new Error('Google Drive upload failed: ' + error.message);
  }
}

module.exports = { uploadFileToDrive };
