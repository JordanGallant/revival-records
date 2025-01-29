"use client";
import React from 'react';
import dynamic from "next/dynamic";
import NavBar from '../_components/navbar';
import AudioVisualizer from '../_components/audioVisaulizer';



const Listen: React.FC = () => {
  return (
    <>
      <div className="absolute top-0 left-0 w-full z-20">
        <NavBar />
        
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
  <h1 className="font-badeen text-5xl text-left mt-4">About Us</h1>
</div>




      <AudioVisualizer/>


    </>
  );
};

export default Listen;