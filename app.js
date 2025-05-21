const express = require('express');
// const uploadRoute = require('./routes/uploadFile');
const listFilesRouter = require('./routes/getFilesFolders');
// const createFolderRouter = require('./routes/createFolder');
// const deleteFileRouter = require('./routes/delete-file');
const authRoutes = require('./routes/auth');
const addAccountRouter = require('./routes/addAccount');
const qs = require('querystring');
const axios = require('axios');
const { oauth2Client, CLIENT_ID, REDIRECT_URI, CLIENT_SECRET } = require('./OAuth');
const pool = require('./config/db');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
// app.use('/api', uploadRoute);
app.use('/api', listFilesRouter);
// app.use('/api', createFolderRouter);
// app.use('/api', deleteFileRouter);
app.use('/api', addAccountRouter);

app.post('/api/get-access-token', async (req, res) => {
  const userRefreshToken = req.body.refreshToken;
  oauth2Client.setCredentials({ refresh_token: userRefreshToken });
  try {
    const { token } = await oauth2Client.getAccessToken();
    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

app.get('/auth/google', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${qs.stringify({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
  })}`;
  res.redirect(authUrl);
});
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code not found');
  }

  try {
    // Exchange authorization code for access + refresh token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    console.log('Token response:', tokenResponse.data);
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const redirectUrl = `mydrive://auth/callback?accessToken=${access_token}&refreshToken=${refresh_token}`;
    res.redirect(redirectUrl);

    // res.send('✅ Authentication successful! You can close this window.');
  } catch (err) {
    console.error('Error exchanging code:', err.response?.data || err.message);
    res.status(500).send('Token exchange failed');
  }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Database time:', res.rows[0]);
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
