"use client";
import React from 'react';
import NavBar from '../_components/navbar';
import dynamic from "next/dynamic";

const Video = dynamic(() => import("../shaders/Video"), {
  ssr: false,
});

const Music: React.FC = () => {
  return (
    <>
      
      <div className="absolute top-0 left-0 w-full z-20">
        <NavBar />
      </div>

      
      <div className="relative z-0 min-h-[100vh]">
        <Video />
        
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
      <h1 className="font-badeen text-5xl text-left mt-4">The Revival Playlist</h1>
          
        </div>
      </div>
    </>
  );
};

export default Music;
