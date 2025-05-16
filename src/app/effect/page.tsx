'use client';
import React, { useRef, useEffect, useState } from 'react';
import Navigator from '../_components/navigator';

const MusicReactiveBar: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [barCount] = useState(64); // fixed bar count

  const handleAudioElement = (audio: HTMLAudioElement) => {
    if (!audio || audioRef.current === audio) return;

    console.log('Got audio element via callback:', audio);
    audioRef.current = audio;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;

    if (!sourceRef.current) {
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();

      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = barCount * 2;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);

        if (containerRef.current) {
          const bars = containerRef.current.children;
          for (let i = 0; i < bars.length; i++) {
            const value = dataArray[i];
            const bar = bars[i] as HTMLElement;
            bar.style.height = `${(value / 255) * 100}%`;
          }
        }

        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
      sourceRef.current = source;
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Top: Navigator */}
      <Navigator ref={handleAudioElement} />

      {/* Bottom: Audio Bars */}
      <div className="w-full h-48 flex items-end justify-center bg-black overflow-hidden">
        <div
          ref={containerRef}
          style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100%' }}
        >
          {Array.from({ length: barCount }).map((_, index) => (
            <div
              key={index}
              style={{
                width: '4px',
                background: 'limegreen',
                height: '10%',
                transition: 'height 0.1s ease',
              }}
            />
          ))}
        </div>
      </div>
              <iframe src="https://reverb-faust-component.vercel.app" width="100%" height="500" allow="autoplay; microphone; accelerometer; gyroscope"title="Faust PWA" />

    </div>
  );
};

export default MusicReactiveBar;
