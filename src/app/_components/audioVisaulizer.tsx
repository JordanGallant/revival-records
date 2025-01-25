import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import shaderPark from '../sketches/shaderPark';
import dynamic from 'next/dynamic';

const P5Wrapper = dynamic(() => import("./P5Wrapper"), { ssr: false });

const AudioVisualizer = () => {
  
  return (
    <>
    <div>
    <P5Wrapper sketch={shaderPark} />
    </div>
    </>
  );
};

export default AudioVisualizer;
