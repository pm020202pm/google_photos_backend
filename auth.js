const { google } = require('googleapis');
const mime = require('mime-types');
const auth = new google.auth.GoogleAuth({
  keyFile: 'mydrive-459718-0e2656c1a8b3.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});


const drive1FolderId = '13YyTw7VFBstK5LLax5lUKUTX3ED3U4e_';
const drive2FolderId = '1MAPJM-c34sSTFWYklCc08Xz3_hwyOZVA';
// export default auth;
module.exports = {auth, drive1FolderId, drive2FolderId};
