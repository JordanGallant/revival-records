const axios = require("axios");
const qs = require("qs");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());


PORT =3001;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PLAYLIST_URL = "https://api.spotify.com/v1/playlists/3S2dYhSHn5IIqQrGFXDf2W";

const getSpotifyToken = async () => {
  try {
    const response = await axios.post(
      TOKEN_URL,
      qs.stringify({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching token:",
      error.response ? error.response.data : error.message
    );
  }
};

app.get("/playlist/tracks", async (req, res) => {
    const token = await getSpotifyToken();
    if (!token) return res.status(500).json({ error: "Failed to retrieve access token" });
  
    try {
      const response = await axios.get(PLAYLIST_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const tracks = response.data.tracks.items.map((item) => ({
        name: item.track.name,
        artist: item.track.artists.map((artist) => artist.name).join(", "),
        album: item.track.album.name,
        popularity: item.track.popularity,
        duration_ms: item.track.duration_ms,
        spotify_url: item.track.external_urls.spotify,
        cover_images: item.track.album.images[1],
      }));
  
      res.json({ tracks });
    } catch (error) {
      console.error("Error fetching playlist data:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch playlist tracks" });
    }
  });
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

