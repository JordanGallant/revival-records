"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = "https://revival-rest-api.onrender.com/playlist/tracks";

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
        if (response.data && Array.isArray(response.data.tracks)) {
          setTracks(response.data.tracks);
        } else {
          console.log('Unexpected data format:', response.data);
          setError('Invalid response format');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch tracks');
      }
    };

    fetchTracks();
  }, []);

  return (
    <div className="p-5 font-sans h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 text-black ">Revival Spotify Playlist</h2>
      {error && <p className="text-red-600">{error}</p>}
      {tracks.length > 0 ? (
        <ul className="space-y-4">
          {[...tracks].reverse().map((track, index) => (
            <li
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg"
            >
              <img
                src={track.cover_images.url}
                alt={track.name}
                className="w-12 h-12 rounded"
              />
              <div>
                <a
                  href={track.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-semibold hover:underline"
                >
                  {track.name}
                </a>
                <p className="text-black m-0">
                  {track.artist} - {track.album}
                </p>
                <p className="text-black text-sm m-0">
                  Underground score: {100 - (track.popularity)} | Duration: {formatDuration(track.duration_ms)}
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
