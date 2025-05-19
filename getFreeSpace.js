
const { google } = require('googleapis');
const { oauth2Client } = require('./OAuth');
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
module.exports = {getDriveFreeSpace};