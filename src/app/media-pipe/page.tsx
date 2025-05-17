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
            // draw lines
            for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
              const start = landmarks[startIdx];
              const end = landmarks[endIdx];

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
    <Navigator/>
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
