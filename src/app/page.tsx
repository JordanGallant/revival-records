"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import LogRocket from "logrocket";
import Navigator from "./_components/navigator";
import exampleSketch from "./sketches/exampleSketch";
import Globe from "./_components/globe";
import Strudel from "./_components/strudel";

const P5Wrapper = dynamic(() => import("../app/_components/P5Wrapper"), {
  ssr: false,
});

export default function Home() {
  

  useEffect(() => {
    LogRocket.init("biv3ve/revival-records");
  }, []);

  
  return (
    <>
      <div className="relative w-full h-full min-h-screen">
        <Navigator />
        
        <div className="absolute inset-0 z-0">
          <Globe />
        </div>
      </div>
      
      {/* Container with relative positioning to create proper stacking context */}
      <div className="w-full h-screen relative">
        {/* P5Wrapper as background with absolute positioning */}
        <div className="absolute inset-0 z-0">
          <P5Wrapper sketch={exampleSketch} />
        </div>

        <Strudel/>
        
      </div>
    </>
  );
}