"use client";
import React from 'react';

import NavBar from '../_components/navbar';
<<<<<<< HEAD
import HydraCanvas from "../shaders/Dance";
=======
import HydraCanvas from "../shaders/dance";
>>>>>>> 063aa60d1f3afcfd0b194e1a6b73b55a8950d1ed
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
        <div className="relative z-0 min-h-96 w-full flex justify-center items-center text-9xl font-badeen tracking-[0.2em]">

          <h1>NO EVENTS YET</h1>
        </div>
  
      </>
    );
  };
  
  export default Listen;