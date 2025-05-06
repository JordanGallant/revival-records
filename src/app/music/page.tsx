"use client";

import { useEffect, useState, useCallback } from "react";
import Navigator from "../_components/navigator";
import dynamic from "next/dynamic";

const Video = dynamic(() => import("../shaders/Video"), {
  ssr: false,
});

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

const BATCH_SIZE = 50;

const Music: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

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

  // Lazy load more songs on scroll
  const handleScroll = useCallback(() => {
    const container = document.getElementById("song-list");
    if (!container) return;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, songs.length));
    }
  }, [songs.length]);

  useEffect(() => {
    const container = document.getElementById("song-list");
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <>
      <Navigator />
      <div>
        <Video />
      </div>

      <div
        id="song-list"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg overflow-y-scroll p-4"
      >
        <h1 className="font-badeen text-5xl text-left mb-4">
          The Revival Playlist
        </h1>

        <ul className="w-full space-y-4 text-white text-base">
          {songs.slice(0, visibleCount).map((song) => (
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

        {visibleCount < songs.length && (
          <p className="text-white text-center w-full mt-4 animate-pulse">Loading more...</p>
        )}
      </div>
    </>
  );
};

export default Music;
