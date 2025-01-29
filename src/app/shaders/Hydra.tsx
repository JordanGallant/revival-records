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
      // @ts-ignore
      osc(10, 0.1, 1.5) 
      // @ts-ignore
        .rotate(() => Math.sin(time * 0.1) * 0.1) 
        // @ts-ignore
        .color(0.5, 0.3, 0.8) 
        // @ts-ignore
        .modulate(noise(2).scale(1.5)) 
        // @ts-ignore
        .out(); 
    }
  }, []);

  return <canvas ref={canvasRef} className="w-full h-[300vh]" />;
}
