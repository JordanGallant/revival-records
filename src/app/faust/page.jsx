'use client';
import React, { useRef, useEffect, useState } from 'react';
import Navigator from '../_components/navigator';

const MusicReactiveBar = () => {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const audioContextRef = useRef(null);
  const mountRef = useRef(null);
  const wamInstanceRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isWamLoaded, setIsWamLoaded] = useState(false);

  const handleAudioElement = (audio) => {
    if (!audio || audioRef.current === audio) return;

    console.log('Got audio element via callback:', audio);
    audioRef.current = audio;
    
    // Initialize audio context and connect audio element with WAM
    initializeAudio(audio);
  };

  const initializeAudio = async (audioElement) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;

      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(audioElement);
      }

      // Initialize WAM
      await loadAndInitializeWam(audioElement, sourceRef.current, audioContext);

      audioElement.onplay = () => {
        audioContext.resume();
      };
    } catch (baseError) {
      console.error('Error setting up audio context:', baseError);
      setErrorMsg(`Audio setup failed: ${baseError.message}`);
    }
  };

  const loadAndInitializeWam = async (audioElement, mediaElementSource, audioContext) => {
    try {
      // Import the WAM SDK
      const { initializeWamHost } = await import('./sdk/index.js');
      const [hostGroupId] = await initializeWamHost(audioContext);

      // Load the WAM
      const { default: WAM } = await import("./index.js");

      // Create a new instance of the plugin
      const wamInstance = await WAM.createInstance(hostGroupId, audioContext);
      wamInstanceRef.current = wamInstance;

      // Connect the audionode to the host and then to destination
      mediaElementSource.connect(wamInstance.audioNode);
      wamInstance.audioNode.connect(audioContext.destination);

      // Load and mount the GUI
      const wamGui = await wamInstance.createGui();
      
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(wamGui);
        setIsWamLoaded(true);
      }

      console.log('WAM initialized and GUI mounted');
    } catch (error) {
      console.error('Error initializing WAM:', error);
      setErrorMsg(`WAM initialization failed: ${error.message}`);
    }
  };

  const sendMidiNote = () => {
    if (wamInstanceRef.current && audioContextRef.current) {
      wamInstanceRef.current.audioNode.scheduleEvents({ 
        type: 'wam-midi', 
        time: audioContextRef.current.currentTime, 
        data: { bytes: new Uint8Array([0x90, 74, 100]) } 
      });
      
      wamInstanceRef.current.audioNode.scheduleEvents({ 
        type: 'wam-midi', 
        time: audioContextRef.current.currentTime + 0.25, 
        data: { bytes: new Uint8Array([0x80, 74, 100]) } 
      });
    }
  };

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="w-full">
      <Navigator ref={handleAudioElement} />
      
      <div className="mt-4">
        <div ref={mountRef} className="wam-mount p-2 bg-gray-100 rounded"></div>
        
        {isWamLoaded && (
          <button 
            onClick={sendMidiNote}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send MIDI Note
          </button>
        )}
      </div>
      
      {errorMsg && (
        <div className="p-4 mt-2 text-red-500 bg-red-100 bg-opacity-10 rounded">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default MusicReactiveBar;
