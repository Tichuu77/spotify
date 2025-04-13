const express = require('express');
const axios = require('axios');
const { getAccessToken } = require('./auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    console.log('Fetching Spotify data...');
    const token = await getAccessToken();

    const [topTracksRes, nowPlayingRes] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const topTracks = topTracksRes.data.items.map((track) => ({
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      uri: track.uri,
    }));

    res.json({
      nowPlaying: nowPlayingRes.data?.item
        ? {
            name: nowPlayingRes.data.item.name,
            artist: nowPlayingRes.data.item.artists.map((a) => a.name).join(', '),
            uri: nowPlayingRes.data.item.uri,
          }
        : 'Nothing is playing',
      topTracks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/pause', async (req, res) => {
  const token = await getAccessToken();
  try {
   
    await axios.put(
      'https://api.spotify.com/v1/me/player/pause',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ message: 'Paused playback' });
  } catch (err) {
    res.status(500).json({ error: err.message ,token});
  }
});

router.put('/play', async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.status(400).json({ error: 'Track URI is required' });
  const token = await getAccessToken();
  try {
   
    await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      { uris: [uri] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({ message: 'Playback started' });
  } catch (err) {
    res.status(500).json({ error: err.message ,token});
  }
});

module.exports = router;
