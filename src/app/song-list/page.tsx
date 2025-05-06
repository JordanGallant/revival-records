"use client";
import React, { useEffect, useState } from "react";

// defines structure of songinfo object that will be stashed
interface SongInfo {
  title: string;
  url: string;
  position: number[];
  features?: any;
}

const Reload: React.FC = () => {
  const [songs, setSongs] = useState<SongInfo[]>([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch("/api/songs");
      const data = await response.json();

      if (Array.isArray(data.songs) && data.songs.length > 0) {
        const formattedSongs: SongInfo[] = data.songs.map((song: any) => ({
          title: song.title,
          url: song.url,
          position: [],
          features: "sick as fuck",
        }));

        setSongs(formattedSongs);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
      <h1 className="font-badeen text-5xl text-left mt-4 text-black">
        Download All Songs
      </h1>
      <div className="w-full p-4">
        {songs.length > 0 && (
          <div className="mt-4">
            <p className="text-black font-mono">Loaded {songs.length} songs</p>
            <div className="mt-2 max-h-96 overflow-y-auto">
              {songs.map((song, index) => (
                <div key={index} className="text-black font-mono text-sm mb-3">
                  <div>{song.title}</div>
                  <div className="text-xs text-blue-800 break-all">{song.url}</div>
                  {song.features && (
                    <div className="text-xs text-gray-600">
                      (labels: {song.features},
                      Position: [{song.position.map(p => p.toFixed(2)).join(", ")}])
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reload;
