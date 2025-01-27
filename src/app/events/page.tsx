"use client";
import React from 'react';

import NavBar from '../_components/navbar';
import HydraCanvas from "../shaders/dance";
const Listen: React.FC = () => {
    return (
      <>
        <div className="absolute top-0 left-0 w-full z-20">
          <NavBar />
          Hello
        </div>
        <div className="relative z-0 min-h-[100vh]">
                
                
                <HydraCanvas />
        
        </div>
  
      </>
    );
  };
  
  export default Listen;