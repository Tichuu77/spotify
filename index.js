const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');


const app = express();
app.use(express.json());
app.use(cors());

const { router: authRoutes } = require('./auth');
const spotifyRoutes = require('./spotify');

app.use('/auth', authRoutes);       // /auth/login → redirects to Spotify
app.use('/spotify', spotifyRoutes); // /spotify → shows top 10 + now playing


// Spotify callback route
app.get('/callback', async (req, res) => {
    // extract the code from query
    const code = req.query.code;
  
    if (!code) {
      return res.status(400).send('Authorization code missing');
    }
  
    // exchange code for access_token + refresh_token
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      const { access_token, refresh_token } = response.data;
  
      // Save tokens to memory (or database)
      global.accessToken = access_token;
      global.refreshToken = refresh_token;
  
      res.send('✅ Spotify Auth Successful! You can now visit /spotify');
    } catch (err) {
      console.error(err.response.data || err.message);
      res.status(500).send('Failed to authenticate with Spotify');
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
