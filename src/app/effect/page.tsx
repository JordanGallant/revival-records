'use client';
import React, { useRef, useEffect, useState } from 'react';
import Navigator from '../_components/navigator';

const Effects: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

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

            sourceRef.current = source;
        }
    };

    

    return (
        <div className="w-full">
            <Navigator ref={handleAudioElement} />

            <iframe id="pwaFrame" src="https://reverb-faust-component.vercel.app" width="100%" height="500" allow="autoplay; microphone; accelerometer; gyroscope" title="Faust PWA" />

        </div>
    );
};

export default Effects;
