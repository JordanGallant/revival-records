'use client';

import React, { useRef, useState, useEffect } from 'react';
import { FaMicrophone } from "react-icons/fa";

const Mic: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupportedBrowser, setIsSupportedBrowser] = useState(false);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recognitionRef = useRef<any | null>(null);

    // Check if browser supports speech recognition on component mount
    useEffect(() => {
    const detectBrowser = async () => {
        const isChrome = navigator.userAgent.includes("Chrome");
        const isEdge = navigator.userAgent.includes("Edg");
        const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

        const isBrave = !!navigator.brave && await navigator.brave.isBrave();

        const supported = hasSpeechRecognition && (isChrome || isEdge) && !isBrave;

        setIsSupportedBrowser(supported);
    };

    detectBrowser();
}, []);

    const handleClick = async () => {
        if (!isRecording) {
            // Initialize audio recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;
                
                // Create recorder for backup/fallback
                const recorder = new MediaRecorder(stream);
                chunksRef.current = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };
                recorder.onstop = () => {
                    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    const url = URL.createObjectURL(audioBlob);
                    
                    // We'll keep this as a fallback in case the speech recognition fails
                    console.log('Recording saved as blob');
                };
                recorderRef.current = recorder;
                recorder.start();

                // Set up speech recognition
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = 'en-US'; // Set language - can be made configurable
                    
                    recognition.onresult = (event) => {
                        let interimTranscript = '';
                        let finalTranscript = '';
                        
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            const transcript = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                finalTranscript += transcript + ' ';
                            } else {
                                interimTranscript += transcript;
                            }
                        }
                        
                        // Update the transcript state with both final and interim results
                        setTranscript(finalTranscript + interimTranscript);
                    };
                    
                    recognition.onerror = (event) => {
                        console.error('Speech recognition error', event.error);
                    };
                    
                    recognition.onstart = () => {
                        console.log('Speech recognition started');
                    };
                    
                    recognition.onend = () => {
                        console.log('Speech recognition ended');
                    };
                    
                    recognition.start();
                    recognitionRef.current = recognition;
                } else {
                    console.error('Speech recognition not supported in this browser');
                    alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
                }

                setIsRecording(true);
                console.log('Recording started');
            } catch (error) {
                console.error('Error accessing microphone:', error);
            }
        } else {
            // Stop recording
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            
            recorderRef.current?.stop();
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
            
            setIsRecording(false);
            console.log('Recording stopped');
        }
    };

    // If browser is not supported, show an appropriate message
    if (!isSupportedBrowser) {
        return (
            <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-gray-600">
                    Speech recognition is only available in Chrome or Edge. Please switch browsers.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div
                onClick={handleClick}
                className="cursor-pointer w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg transition-transform hover:scale-110"
            >
                <FaMicrophone className={`w-8 h-8 ${isRecording ? 'text-red-600 animate-pulse' : 'text-gray-600'}`} />
            </div>
            
            <p className="text-sm text-gray-600">
                {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
            
            {transcript && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full max-w-lg">
                    <h3 className="font-medium mb-2">Transcript:</h3>
                    <p className="text-gray-800">{transcript}</p>
                </div>
            )}
        </div>
    );
};

export default Mic;

// Add TypeScript definitions to make the code work
declare global {
  interface Navigator {
    brave?: {
      isBrave: () => Promise<boolean>;
    };
  }

  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}