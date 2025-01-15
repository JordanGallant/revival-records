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

      // Hydra's functions (e.g., osc, noise) are globally available now
      osc(10, 0.1, 1.5) // Oscillator for wave-like visuals
        .rotate(() => Math.sin(time * 0.1) * 0.1) // Dynamic rotation
        .color(0.5, 0.3, 0.8) // Apply color
        .modulate(noise(2).scale(1.5)) // Add noise modulation
        .out(); // Output to canvas
    }
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
