'use client';
import React, { useRef, useEffect, useState } from 'react';
import Navigator from '../_components/navigator';

const MusicReactiveBars: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [barCount, setBarCount] = useState(64); // default bar count

  const handleAudioElement = (audio: HTMLAudioElement) => {
    console.log('Got audio element via callback:', audio);
    audioRef.current = audio;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = barCount * 2; // fftSize must be twice barCount

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      if (containerRef.current) {
        const bars = containerRef.current.children;
        for (let i = 0; i < bars.length; i++) {
          const value = dataArray[i];
          const bar = bars[i] as HTMLElement;
          bar.style.height = `${value}px`;
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div>
      <Navigator onAudioElementCreated={handleAudioElement} />
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '200px',
          gap: '2px',
          marginTop: '20px',
        }}
      >
        {Array.from({ length: barCount }).map((_, index) => (
          <div
            key={index}
            style={{
              width: '4px',
              background: 'limegreen',
              height: '10px',
              transition: 'height 0.1s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MusicReactiveBars;
