"use client";
import React from "react";
import dynamic from "next/dynamic";
import Navigator from "../_components/navigator";
import AudioVisualizer from "../_components/audioVisaulizer";

const Listen: React.FC = () => {
  return (
    <>
      <Navigator />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
        <h1 className="font-badeen text-5xl text-left mt-4">About Us</h1>
        <p> we are a UKG record label based in the Netherlands</p>
      </div>

      <AudioVisualizer />
    </>
  );
};

export default Listen;
