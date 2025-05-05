"use client";
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
  //removes silence in signal
  function trimSilence(
    signal: Float32Array,
    sampleRate: number,
    dbThreshold: number = -50,
    minSilenceDuration: number = 0.02,
    paddingDuration: number = 0.05
  ): Float32Array {
    const threshold = Math.pow(10, dbThreshold / 20); // convert dBFS to linear amplitude
    const minSilenceSamples = Math.floor(minSilenceDuration * sampleRate);
    const paddingSamples = Math.floor(paddingDuration * sampleRate);
  
    let start = 0;
    let end = signal.length - 1;
  
    // Find first significant sample
    for (let i = 0; i < signal.length; i++) {
      if (Math.abs(signal[i]) > threshold) {
        if (i > minSilenceSamples) start = i;
        break;
      }
    }
  
    // Find last significant sample
    for (let i = signal.length - 1; i >= 0; i--) {
      if (Math.abs(signal[i]) > threshold) {
        if ((signal.length - i) > minSilenceSamples) end = i;
        break;
      }
    }
  
    const safeStart = Math.max(0, start - paddingSamples);
    const safeEnd = Math.min(signal.length - 1, end + paddingSamples);
  
    const trimmed = signal.slice(safeStart, safeEnd + 1);
  
    // ✅ Make sure to return a clean Float32Array
    return new Float32Array(trimmed);
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
    const [essentiaLoaded, setEssentiaLoaded] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<string>("Initializing...");
    const essentiaRef = useRef<any>(null);

    useEffect(() => {
        // Load Essentia.js scripts dynamically
        const loadEssentiaScripts = async () => {
            try {
                setLoadingStatus("Loading Essentia.js scripts...");

                // Helper function to load scripts dynamically
                const loadScript = (src: string): Promise<void> => {
                    return new Promise((resolve, reject) => {
                        // Check if script already exists to avoid duplicates
                        if (document.querySelector(`script[src="${src}"]`)) {
                            resolve();
                            return;
                        }

                        const script = document.createElement('script');
                        script.src = src;
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                        document.head.appendChild(script);
                    });
                };

                // Load Essentia.js scripts in sequence (WASM first, then core)
                // Replace <version> with the specific version you want to use (e.g., 0.1.0)
                const version = "0.1.0"; // Update this to your required version
                await loadScript(`https://cdn.jsdelivr.net/npm/essentia.js@${version}/dist/essentia-wasm.web.js`);
                await loadScript(`https://cdn.jsdelivr.net/npm/essentia.js@${version}/dist/essentia.js-core.js`);

                setLoadingStatus("Initializing Essentia.js...");
                // @ts-ignore - EssentiaWASM is loaded from CDN and not recognized by TypeScript
                const EssentiaWasm = await EssentiaWASM();
                // @ts-ignore - Essentia is loaded from CDN and not recognized by TypeScript
                essentiaRef.current = new Essentia(EssentiaWasm);

                console.log("Essentia.js loaded successfully!");
                console.log("Version:", essentiaRef.current.version);
                console.log("Available algorithms:", essentiaRef.current.algorithmNames);

                setEssentiaLoaded(true);
                setLoadingStatus("Essentia.js loaded successfully!");

                // fetch songs after  essentia is inititiated
                await fetchSongs();

            } catch (error) {
                console.error("Error loading Essentia.js:", error);
                setLoadingStatus(`Error loading Essentia.js: ${error}`);
                // Continue with fetching songs even if Essentia fails
                await fetchSongs();
            }
        };

        loadEssentiaScripts();
    }, []); // runs once on mount

    //fetch and format songs
    const fetchSongs = async () => {
        try {
            setLoadingStatus("Fetching songs...");
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
                setLoadingStatus("Processing audio files...");

                // process song from url
                for (let i = 0; i < formattedSongs.length; i++) {
                    const song = formattedSongs[i];
                    try {
                        setLoadingStatus(`Processing audio ${i + 1}/${formattedSongs.length}: ${song.title}`);

                        // Access the URL and process it
                        const response = await fetch(song.url);
                        //converts to arraybuffer
                        const arrayBuffer = await response.arrayBuffer();
                        const audioContext = new AudioContext();
                        //extracts key from audio
                        const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
                        let mono = convertToMono(decodedAudio); //convert to mono function^
                        const trimmed = trimSilence(mono, decodedAudio.sampleRate); //trim silence and delay function^
                        const cleanSignal = new Float32Array(trimmed); // stoes it in a new array -> no silence
            
                        if (!cleanSignal.length || cleanSignal.some(x => !Number.isFinite(x))) {
                            throw new Error("Invalid audio buffer");
                          }
                        //const result = essentiaRef.current.KeyExtractor(signal, decodedAudio.sampleRate);
                        const bpm = essentiaRef.current.BeatTrackerMultiFeature(cleanSignal);




                        console.log(bpm)


                        //calculate position






                        setSongs(prevSongs => {
                            const updatedSongs = [...prevSongs];
                            // Mark this song as processed in some way if needed
                            return updatedSongs;
                        });

                    } catch (error) {
                        console.error(`Error processing ${song.title}:`, error);
                    }
                }

                setLoadingStatus("Ready");
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            setLoadingStatus(`Error fetching songs: ${error}`);
        }
    };

    return (
        <>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
                <h1 className="font-badeen text-5xl text-left mt-4 text-black">
                    Reloading Songs
                </h1>

                <div className="w-full p-4">
                    <p className="text-black font-mono">{loadingStatus}</p>

                    {essentiaLoaded && (
                        <p className="text-green-700 font-mono">
                            Essentia.js v{essentiaRef.current?.version}
                        </p>
                    )}

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