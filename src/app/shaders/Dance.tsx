"use client";
import { useEffect, useRef } from "react";
import HydraSynth from "hydra-synth";

export default function Hydra() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Create a Hydra instance
      new HydraSynth({
        canvas: canvasRef.current,
        detectAudio: false,
      });

      s0.initVideo('https://upload.wikimedia.org/wikipedia/commons/d/d0/Serpentine_Dance_%281895%29_-_yt.webm')
      src(s0).out()
    }
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}