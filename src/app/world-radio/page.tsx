'use client'
import React, { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { TbPlayerPlayFilled, TbPlayerPauseFilled, TbPlayerTrackPrevFilled,TbPlayerTrackNextFilled } from "react-icons/tb";

let radioIndex = 0;

const radios = [
  {
    name: 'AlgoaFM',
    url: 'https://edge.iono.fm/xice/54_high.mp3'
  },
  {
    name: '5FM',
    url: 'https://5fm.live.stream.theeye.tv/5fm'
  },
  {
    name: 'KFM',
    url: 'https://kfm.live.stream.theeye.tv/kfm'
  },
  {
    name: 'Radio 702',
    url: 'https://ice702.live.stream.theeye.tv/702'
  }
];

const Radio: React.FC = () => {
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    soundRef.current = new Howl({
      src: [radios[radioIndex].url],
      html5: true,
      format: ['mp3'],
    });

    return () => {
      soundRef.current?.unload();
    };
  }, []);

  const togglePlayPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.stop(); // Or use stop() if pause doesn't work well for live stream
      setIsPlaying(false);
    } else {
      soundRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () =>{
    radioIndex+=1
    console.log("Index:",radioIndex)
  }

  const previousSong = () =>{
    radioIndex-=1
    console.log("Index:",radioIndex)

  }

  return (
    <>
    <div className="w-full flex justify-center itmes-center">
        <h1>Now Playing: {radios[radioIndex].name} </h1>
      <button onClick={previousSong}><TbPlayerTrackPrevFilled/></button>

      <button onClick={togglePlayPause}>
        {isPlaying ? <TbPlayerPauseFilled /> : <TbPlayerPlayFilled />}
      </button>

      <button onClick={nextSong}><TbPlayerTrackNextFilled/></button>
      </div>
    </>
    
  );
};

export default Radio;
