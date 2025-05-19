'use client';

import { useEffect, useRef } from 'react';
import {
  HandLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';
import Navigator from '../_components/navigator';

export default function HandLandmarkerComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lowpassRef = useRef<BiquadFilterNode | null>(null)
  const highpassRef = useRef<BiquadFilterNode | null>(null);



  const handleAudioElement = (audio: HTMLAudioElement) => {
    if (!audio || audioRef.current === audio) return;

    audioRef.current = audio;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;

    if (!sourceRef.current) {
      const source = audioContext.createMediaElementSource(audio);
      const gainNode = audioContext.createGain();
      const lowpass = audioContext.createBiquadFilter();
      const highpass = audioContext.createBiquadFilter();
      const analyser = audioContext.createAnalyser();


      highpass.type = 'highpass';
      highpass.frequency.value = 500; // default cutoff

      lowpass.type = 'lowpass';
      lowpass.frequency.value = 1000; // default cutoff

      source.connect(gainNode);
      gainNode.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(analyser);
      analyser.connect(audioContext.destination);

      sourceRef.current = source;
      gainNodeRef.current = gainNode;
      lowpassRef.current = lowpass; // just to reuse the same ref for simplicity
      highpassRef.current = highpass;

    }
  };


  useEffect(() => {
    const HAND_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ];

    let handLandmarker: HandLandmarker | null = null;
    let lastVideoTime = -1;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const vision = await FilesetResolver.forVisionTasks(
          // You can also host this locally if needed
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        requestAnimationFrame(renderLoop);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    const renderLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !handLandmarker) {
        requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        requestAnimationFrame(renderLoop);
        return;
      }

      const now = performance.now();

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        const results = handLandmarker.detectForVideo(video, now);
        lastVideoTime = video.currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            //distance thum index
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];

            const dx = thumbTip.x - indexTip.x;
            const dy = thumbTip.y - indexTip.y;
            const dz = thumbTip.z - indexTip.z;


            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz); //distnace between index and thumb

            const clampedDistance = Math.min(Math.max(distance, 0.0), 1.6); // limit to 0.0 - 0.4
            const volume = clampedDistance / 0.4; // map to 0.0 - 1.0 -> map distnace to volume

            if (gainNodeRef.current) {
              gainNodeRef.current.gain.value = volume;
            }
            //lowpass
            const wrist = landmarks[0];
            const middleTip = landmarks[12];

            const dwx = wrist.x - middleTip.x;
            const dwy = wrist.y - middleTip.y;
            const dwz = wrist.z - middleTip.z;

            const wristToMiddleDist = Math.sqrt(dwx * dwx + dwy * dwy + dwz * dwz);
            const wristDistnace = Math.min(Math.max(wristToMiddleDist, 0.0), 1.6);

            const minFreq = 300;
            const maxFreq = 5000;
            const mappedFreq = minFreq + (wristDistnace / 0.4) * (maxFreq - minFreq);

            if (lowpassRef.current && 'frequency' in lowpassRef.current) {
              lowpassRef.current.frequency.value = mappedFreq;
            }

            //high pass
            const pinkyTip = landmarks[20];

            const dpx = pinkyTip.x - wrist.x;
            const dpy = pinkyTip.y - wrist.y;
            const dpz = pinkyTip.z - wrist.z;

            const pinkyDist = Math.sqrt(dpx * dpx + dpy * dpy + dpz * dpz);
            const clampedPinkyDist = Math.min(Math.max(pinkyDist, 0.0), 1.6);

            const minHighFreq = 100;
            const maxHighFreq = 3000;
            const mappedHighFreq = maxHighFreq - (clampedPinkyDist / 0.4) * (maxHighFreq - minHighFreq);

            if (highpassRef.current && 'frequency' in highpassRef.current) {
              highpassRef.current.frequency.value = mappedHighFreq;
            }




            // draw lines
            for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
              const start = landmarks[startIdx];
              const end = landmarks[endIdx]
              ctx.beginPath();
              ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
              ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
              ctx.strokeStyle = 'lime';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            // draw dots
            for (const landmark of landmarks) {
              ctx.beginPath();
              ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
          }
        }
      }

      requestAnimationFrame(renderLoop); // loops through frames and draws hands
    };

    init();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <Navigator ref={handleAudioElement} />

      <p>1. Volume is mapped to: Disntace between index finger and thumb</p>
      <p>2. Low pass filter  is mapped to: Disntace between middle finger and wrist</p>
      <p>3. High pass filter  is mapped to: Disntace between Pinky finger and wrist</p>
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="relative w-[640px] h-[480px]">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full"

            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            width={640}
            height={480}
          />
        </div>
      </div>
    </>
  );
}
