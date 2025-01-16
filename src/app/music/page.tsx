"use client";
import React from 'react';
import dynamic from "next/dynamic";
import Video from "../shaders/Video";
import NavBar from '../_components/navbar';

const Blog: React.FC = () => {
  return (
    <>
      
      <div className="absolute top-0 left-0 w-full z-20">
        <NavBar />
      </div>

      
      <div className="relative z-0 min-h-[100vh]">
        
        
        <Video />

    
  
</div>

        
    </>
  );
};

export default Blog;