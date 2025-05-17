/////DSP IN THE BROWSER//////

'use client';
import React, { useRef } from 'react';
import Navigator from '../../_components/navigator';

const Reverb: React.FC = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    let sendAudio;
  
const handleAudioElement = (audio: HTMLAudioElement) => {
    if (!audio) return;

    if (audioRef.current !== audio) {
        console.log('Got audio element via callback:', audio);
        audioRef.current = audio;

        //sends src every time track is changed
        audio.addEventListener('loadedmetadata', sendCurrentAudioToIframe);
    }
};

const sendCurrentAudioToIframe = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const sendAudio = audio.src;
    console.log('Sending audio source:', sendAudio);
    iframeRef.current?.contentWindow?.postMessage(sendAudio, '*');
};


    const SendMessage = () => {
        iframeRef.current?.contentWindow?.postMessage(sendAudio, '*');
        console.log("SENDING MESSAGE") //sends audio src to reverb component
    };

    return (
        <div className="w-full">
            <Navigator ref={handleAudioElement} />

            <div className="p-4">
            </div>

            <iframe
                ref={iframeRef}
                onLoad={SendMessage}
                id="pwaFrame"
                src="https://reverb-faust-component.vercel.app"
                width="100%"
                height="500"
                allow="autoplay; microphone; accelerometer; gyroscope"
                title="Faust PWA"
            />
        </div>
    );
};

export default Reverb;