"use client";
import React from 'react';
import dynamic from "next/dynamic";
import NavBar from '../_components/navbar';
import AudioVisualizer from '../_components/threeAudio';



const Listen: React.FC = () => {
  return (
    <>
      <div className="absolute top-0 left-0 w-full z-20">
        <NavBar />
        Hello
      </div>
    </>
  );
};

export default Listen;