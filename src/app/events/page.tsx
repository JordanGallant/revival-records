"use client";
import React from 'react';
import NavBar from '../_components/navbar';
import dynamic from "next/dynamic";
import Star from '../_components/star';

const HydraCanvas = dynamic(() => import("../shaders/Dance"), {
  ssr: false,
});
const Events: React.FC = () => {
    return (
      <>
        <div className="absolute top-0 left-0 w-full z-20">
          <NavBar />
          
        </div>
        <div className="relative z-0 min-h-[100vh]">
                
                
                <HydraCanvas />
        
        </div>
        <div className="relative z-0 min-h-16 w-full flex justify-center items-center text-9xl font-badeen tracking-[0.2em] mb-24">

          <h1>NO EVENTS YET</h1>
        </div>
        <div className='flex'>
      <Star/>
      <Star/>
      <Star/>
        </div>
  
      </>
    );
  };
  
  export default Events;