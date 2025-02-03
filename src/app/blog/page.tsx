"use client";
import React from "react";
import Navigator from "../_components/navigator";
import dynamic from "next/dynamic";

const HydraCanvas = dynamic(() => import("../shaders/Hydra"), {
  ssr: false,
});

const Blog: React.FC = () => {
  return (
    <>
      <Navigator />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-start z-30 bg-stone-200 bg-opacity-10 w-[90%] h-2/3 group hover:bg-opacity-50 rounded-lg">
        <h1 className="font-badeen text-5xl text-left mt-4">Blog</h1>
        <p> Coming Soon.</p>
      </div>
     
        <HydraCanvas />


     
    </>
  );
};

export default Blog;
