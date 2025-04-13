const express = require('express');
const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const router = express.Router();

let accessToken = '';
let refreshToken = '';

router.get('/login', (req, res) => {
  const scope = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-top-read',
  ].join(' ');

  const redirectUrl = `https://accounts.spotify.com/authorize?${qs.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.REDIRECT_URI,
  })}`;

  res.redirect(redirectUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64'),
        },
      }
    );

    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    res.send(
      'Login successful. You can now call /spotify to see top tracks and current song.'
    );
  } catch (error) {
    res.status(400).json({ error: 'Failed to get tokens', detail: error.message });
  }
});

// Function to get access token
async function getAccessToken() {
  if (!accessToken) {
    await refreshAccessToken();
  }
  return accessToken;
}

// Function to refresh access token
async function refreshAccessToken() {
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
      },
    }
  );

  accessToken = response.data.access_token;
}

module.exports = { router, getAccessToken };
