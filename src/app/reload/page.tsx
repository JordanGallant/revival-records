"use client";
import React, { useEffect, useRef, useState } from "react";

const S3_BUCKET_URL = "https://revival-records.s3.amazonaws.com"

const extractSongTitle = (filename: string): string => {
  // Remove file extension and replace underscores/hyphens with spaces
  return filename
    .replace(/\.(mp3|wav|ogg|flac|m4a)$/i, "")
    .replace(/[_-]/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface SongInfo { // will be stored in redis
  title: string; // Formatted title for display
  url: string;   // Full URL to the song
  position: [];
}

const Reload: React.FC = () => {
  const [songs, setSongs] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    //function to fetch songs and format them
    const fetchSongs = async () => {
      const response = await fetch('/api/songs');
      const data = await response.json();

        //checks to see if right format
      if (Array.isArray(data.songs) && data.songs.length > 0) {
        const formattedSongs: SongInfo[] = data.songs.map((key: string) => ({
          title: extractSongTitle(key),
          url: `${S3_BUCKET_URL}/${encodeURIComponent(key)}`, //adds %20 to instead of spaces, better URL parsing, removing whitespace and including + also works
          position: []//position still needs to be calcuated
        }));
        setSongs(formattedSongs);
        console.log(formattedSongs)

        for(const song of formattedSongs){
          const audioBuffer = await fetchAudioBuffer(song.url)
          console.log(audioBuffer)
        }
      }
    };
    //function to fetch all the songs
    const fetchAudioBuffer = async (url: string): Promise<AudioBuffer> => {
      const audioCtx = new AudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioCtx.decodeAudioData(arrayBuffer);
    };
    
    fetchSongs();
  }, []); //runs once on mount

  return (
    <>
     
      <div>

      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
        <h1 className="font-badeen text-5xl text-left mt-4 text-black">
          Reloading Songs
        </h1>
      </div>
    </>
  );
};

export default Reload;