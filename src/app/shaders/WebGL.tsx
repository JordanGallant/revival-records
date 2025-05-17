'use client';

import { useEffect, useRef } from 'react';
import { createCanvas } from 'shader-park-core';

export default function ShaderComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Create the shader canvas
      createCanvas(canvasRef.current, (sp) => {
        // Example shader
        sp.torusKnot();
        sp.rotateY(sp.time);
        sp.color(sp.sin(sp.time), sp.cos(sp.time), sp.sin(sp.time * 0.5));
      });
    }
  }, []);

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}
