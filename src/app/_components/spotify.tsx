import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = "http://localhost:3000/playlist/tracks";

interface Track {
  name: string;
  artist: string;
  album: string;
  popularity: number;
  duration_ms: number;
  spotify_url: string;
  cover_images: {
    url: string;
    width: number;
    height: number;
  };
}

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, "0")}`;
};

const Spotify: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(api);
        setTracks(response.data.tracks); // Adjusted to access 'tracks' array
      } catch (err) {
        setError('Failed to fetch tracks');
        console.error(err);
      }
    };

    fetchTracks();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Revival Playlist</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tracks.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tracks.map((track, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "15px",
                background: "#f8f8f8",
                padding: "10px",
                borderRadius: "8px"
              }}
            >
              <img
                src={track.cover_images.url}
                alt={track.name}
                width={50}
                height={50}
                style={{ borderRadius: "4px" }}
              />
              <div>
                <a style={{color:"black"}}href={track.spotify_url} target="_blank" rel="noopener noreferrer">
                  <strong>{track.name}</strong>
                </a>
                <p style={{ margin: 0, color:"black"}}>
                  {track.artist} - {track.album}
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "black" }}>
                  Popularity: {track.popularity} | Duration: {formatDuration(track.duration_ms)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Spotify;
