"use client";

import Navigator from "./_components/navigator";
import dynamic from "next/dynamic";
import exampleSketch from "./sketches/exampleSketch";
import ThreeDee from "./_components/object";
import Spotify from "./_components/spotify";

const P5Wrapper = dynamic(() => import("../app/_components/P5Wrapper"), {
  ssr: false,
});


export default function Home() {
  return (
    <>
    <div className="cursor-none relative w-full h-full min-h-screen">
      <Navigator />
      <P5Wrapper sketch={exampleSketch} />
      
      <div className="absolute inset-0 z-0 ">
      <ThreeDee />
      </div>
    </div>
    <div className="w-full h-scree">
      <Spotify/>

    </div>
    </>
  );
}
