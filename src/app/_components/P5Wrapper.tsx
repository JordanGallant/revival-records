import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

// We should use `typeof p5` to reference the type of the p5.js instance
interface P5WrapperProps {
  sketch: (p: typeof p5) => void; // Use `typeof p5` to get the type of the p5 instance
}

const P5Wrapper: React.FC<P5WrapperProps> = ({ sketch }) => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sketchRef.current) {
      const p5Instance = new p5(sketch, sketchRef.current);

      return () => {
        p5Instance.remove();
      };
    }
  }, [sketch]);

  return <div ref={sketchRef}></div>;
};

export default P5Wrapper;
