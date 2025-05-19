'use client'
import React, { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import {
  TbPlayerPlayFilled,
  TbPlayerPauseFilled,
  TbPlayerTrackPrevFilled,
  TbPlayerTrackNextFilled
} from "react-icons/tb";
import Navigator from "../_components/navigator";

const radios = [
  {
    name: 'AlgoaFM',
    url: 'https://edge.iono.fm/xice/54_high.mp3',
    location: 'Gqeberha, South Africa'
  },
  {
    name: 'Switch Brisbane',
    url: 'https://28853.live.streamtheworld.com/4YBICEAAC.aac?dist=radiogarden',
    location: 'Brisbane, Australia'
  },
  {
    name: 'Radio Eigekai Indies',
    url: 'https://n05.radiojar.com/66zgtscuc1duv?rj-ttl=5&rj-tok=AAABlubqsF4AiYS_cCCukcxELw',
    location: 'Tokyo, Japan'
  },
  {
    name: 'RIK Radio 4 88.2 Λευκωσία',
    url: 'https://r1.cloudskep.com/cybcr/cybc4/icecast.audio',
    location: 'Nicosia, Cyprus'
  },
  {
    name: 'Big B Radio - Kpop',
    url: 'https://antares.dribbcast.com/proxy/kpop?mp=/s',
    location: 'Seoul, South Korea'
  },
  {
    name: 'Rádio Nova Iguaçu FM 94.1',
    url: 'https://virtues.audio:8010/stream',
    location: 'Salvador BA, Brazil'
  }
];
//list gloabal country codes
const countryNameToCode = {
  "south africa": "ZA",
  "united states": "US",
  "united kingdom": "GB",
  "germany": "DE",
  "france": "FR",
  "japan": "JP",
  "australia": "AU",
  "cyprus": "CY",
  "south korea": "KR",
  "brazil": "BR",
};


const Radio: React.FC = () => {
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [radioIndex, setRadioIndex] = useState(0);

  useEffect(() => {
    soundRef.current?.stop();
    soundRef.current?.unload();

    soundRef.current = new Howl({
      src: [radios[radioIndex].url],
      html5: true,
      format: ['mp3'],
      onend: () => setIsPlaying(false),
    });

    if (isPlaying) {
      soundRef.current.play();
    }

    return () => {
      soundRef.current?.unload();
    };
  }, [radioIndex]);

  const togglePlayPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.stop();
      setIsPlaying(false);
    } else {
      soundRef.current.play();
      setIsPlaying(true);
    }
  };

  function countryCodeToFlagEmoji(countryCode) {
  const codePoints = [...countryCode.toUpperCase()].map(
    char => 0x1F1E6 + char.charCodeAt(0) - 65
  );
  return String.fromCodePoint(...codePoints);
}

  const getFlag = () => {
  const location = radios[radioIndex].location;
  const parts = location.split(",");
  const country = parts[parts.length - 1].trim().toLowerCase(); // normalize casing
  const code = countryNameToCode[country];
  return code ? countryCodeToFlagEmoji(code) : "";
};

  const nextStation = () => {
    setIsPlaying(false);
    setRadioIndex((prevIndex) => (prevIndex + 1) % radios.length);
  };

  const previousStation = () => {
    setIsPlaying(false);
    setRadioIndex((prevIndex) => (prevIndex - 1 + radios.length) % radios.length);
  };

  return (
<>
    <Navigator/>
    <div
    className={`min-h-screen w-full flex flex-col items-center justify-center transition-all duration-500
      ${radioIndex === 0 ? 'bg-gradient-to-r from-blue-400 to-green-500' :
        radioIndex === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
        radioIndex === 2 ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
        radioIndex === 3 ? 'bg-gradient-to-r from-green-400 to-blue-600' :
        radioIndex === 4 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' :
        'bg-gradient-to-r from-orange-400 to-rose-500'}
    `}
  >
    
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-xl font-semibold">{radios[radioIndex].name}</h1>
      <p className="text-[110px] text-gray-600">{getFlag()}</p>
       <p className="text-sm text-gray-600">{radios[radioIndex].location}</p>
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={previousStation}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Previous Station"
        >
          <TbPlayerTrackPrevFilled size={32} />
        </button>
        <button
          onClick={togglePlayPause}
          className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <TbPlayerPauseFilled size={28} /> : <TbPlayerPlayFilled size={28} />}
        </button>
        <button
          onClick={nextStation}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          aria-label="Next Station"
        >
          <TbPlayerTrackNextFilled size={32} />
        </button>
      </div>
    </div>
    </div>
    </>
  );
};

export default Radio;
