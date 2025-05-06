"use client";

import { useEffect, useState } from "react";
import Navigator from "../_components/navigator";
import dynamic from "next/dynamic";

// const Video = dynamic(() => import("../shaders/Video"), {
//   ssr: false,
// });

type Song = {
  Track: number;
  title: string;
  url: string;
  danceability: number;
  BPM: number;
  energy: number;
  key: string;
  loudess: string;
  "spectral-centroid": string;
  mfcc: number[];
  flux: number;
};

const Music: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("/api/redis");
        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  return (
    <>
      <Navigator />
      <div>
        {/* <Video /> */}
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg overflow-y-scroll p-4">
        <h1 className="font-badeen text-5xl text-left mb-4">
          The Revival Playlist
        </h1>

        <ul className="w-full space-y-4 text-white text-base">
          {songs.map((song) => (
            <li
              key={song.Track}
              className="bg-stone-900 bg-opacity-50 rounded-lg p-4 hover:bg-opacity-70 transition"
            >
              <h2 className="text-xl font-semibold">{song.title}</h2>
              <p>BPM: {song.BPM.toFixed(1)}</p>
              <p>Key: {song.key}</p>
              <p>Danceability: {song.danceability.toFixed(2)}</p>
              <audio controls className="mt-2 w-full">
                <source src={song.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Music;
