"use client";
import { input } from "@nextui-org/theme";
import { features } from "process";
import React, { useEffect, useRef, useState } from "react";

const S3_BUCKET_URL = "https://revival-records.s3.amazonaws.com";

const extractSongTitle = (filename: string): string => {
    // clean filenames -> title
    return filename
        .replace(/\.(mp3|wav|ogg|flac|m4a)$/i, "")
        .replace(/[_-]/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};
// function converts audio from stero to mono
function convertToMono(audioBuffer: AudioBuffer): Float32Array {
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.getChannelData(1);
    const mono = new Float32Array(audioBuffer.length);

    for (let i = 0; i < audioBuffer.length; i++) {
        const left = ch0[i];
        const right = ch1[i];
        const avg = (left + right) / 2;
        mono[i] = Number.isFinite(avg) ? avg : 0;
    }

    return mono;
}
//detect start time
function detectStartTime(audioData, sampleRate, threshold = 0.01, frameSize = 1024) {
    const frames = Math.floor(audioData.length / frameSize);

    for (let i = 0; i < frames; i++) {
        let rmsSum = 0;

        for (let j = 0; j < frameSize; j++) {
            const idx = i * frameSize + j;
            if (idx < audioData.length) {
                rmsSum += audioData[idx] * audioData[idx];
            }
        }

        const rms = Math.sqrt(rmsSum / frameSize);

        if (rms > threshold) {
            // Found the start time, convert from samples to seconds
            return i * frameSize / sampleRate;
        }
    }

    // If no start time found, return 0
    return 0;
}


//defines structure of songinfo object that will be stashed
interface SongInfo {
    title: string;
    url: string;   // full URL to the song
    position: any[]; // Will store calculated positions
    features?: any; // Optional field to store Essentia.js features
}

const Reload: React.FC = () => {
    const [songs, setSongs] = useState<SongInfo[]>([]);

    useEffect(() => {
        // Load Essentia.js scripts dynamically
        
        fetchSongs();
    }, []); // runs once on mount

    //fetch and format songs
    const fetchSongs = async () => {
        try {
            
            const response = await fetch('/api/songs');//gets song names form api -> s3 bucket
            const data = await response.json();

            //if right format
            if (Array.isArray(data.songs) && data.songs.length > 0) {
                const formattedSongs: SongInfo[] = data.songs.map((key: string) => ({
                    title: extractSongTitle(key),
                    url: `${S3_BUCKET_URL}/${encodeURIComponent(key)}`,
                    position: [], // Position still needs to be calculated
                    features: "sick as fuck"
                }));

                // Set initial songs state
                setSongs(formattedSongs);
                
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    };

    return (
        <>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
                <h1 className="font-badeen text-5xl text-left mt-4 text-black">
                    Reloading Songs
                </h1>

                <div className="w-full p-4">
                    

                    

                    {songs.length > 0 && (
                        <div className="mt-4">
                            <p className="text-black font-mono">Loaded {songs.length} songs</p>

                            <div className="mt-2 max-h-96 overflow-y-auto">
                                {songs.map((song, index) => (
                                    <div key={index} className="text-black font-mono text-sm mb-1">
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
        </>
    );
};

export default Reload;