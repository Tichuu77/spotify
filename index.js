const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const { router: authRoutes } = require('./auth');
const spotifyRoutes = require('./spotify');

app.use('/auth', authRoutes);       // /auth/login → redirects to Spotify
app.use('/spotify', spotifyRoutes); // /spotify → shows top 10 + now playing

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
