"use client";
import React from 'react';
import NavBar from '../_components/navbar';
import dynamic from "next/dynamic";

const HydraCanvas = dynamic(() => import("../shaders/Hydra"), {
  ssr: false,
});

const Blog: React.FC = () => {
  return (
    <>
      
      <div className="absolute top-0 left-0 w-full z-20">
        <NavBar />
      </div>

      
      <div className="relative z-0 min-h-[300vh]">
        
        
        <HydraCanvas />

       
        <div className="absolute top-[10%] left-10 flex flex-col items-center justify-start z-30 bg-stone-200 bg-opacity-10 w-[calc(100%-5rem)] min-h-[200vh] group hover:bg-opacity-50 rounded-lg">
  
  <div className="absolute top-[2.5%] h-96 w-full flex flex-col md:flex-row justify-between rounded-lg mx-5">
    <div className="h-full w-full md:w-1/3 outline outline-1 rounded-lg mb-4 md:mb-0 mx-5"></div>
    <div className="h-full w-full md:w-2/3 outline outline-1 rounded-lg mx-5"></div>
  </div>

  <div className="absolute top-[35%] h-96 w-full flex flex-col md:flex-row justify-between rounded-lg mx-5">
    <div className="h-full w-full md:w-1/3 outline outline-1 rounded-lg mb-4 md:mb-0 mx-5"></div>
    <div className="h-full w-full md:w-2/3 outline outline-1 rounded-lg mx-5"></div>
  </div>

  <div className="absolute top-[70%] h-96 w-full flex flex-col md:flex-row justify-between rounded-lg mx-5">
    <div className="h-full w-full md:w-1/3 outline outline-1 rounded-lg mb-4 md:mb-0 mx-5"></div>
    <div className="h-full w-full md:w-2/3 outline outline-1 rounded-lg mx-5"></div>
  </div>
  
</div>

        

        
        
      </div>
    </>
  );
};

export default Blog;
