"use client";
import NavBar from "./_components/navbar";
import dynamic from "next/dynamic";
import exampleSketch from "./sketches/exampleSketch";
import ThreeDee from "./_components/object";


 

const P5Wrapper = dynamic(() => import("../app/_components/P5Wrapper"), { ssr: false });



export default function Home() {
  return (
    <div className="relative w-screen h-screen cursor-none">
      {/* NavBar */}
      <div className="absolute top-0 left-0 w-full z-20">
        <NavBar />
      </div>

      {/* 3D Object */}
      <div className="absolute inset-0 flex items-center justify-center z-10 ">
        <div className="w-3/4 h-1/2 sm:w-2/3 sm:h-2/3 md:w-1/2 md:h-3/4 flex items-center justify-center pt-10">
          <ThreeDee />
        </div>
      </div>

      {/* P5 Sketch */}
      <div className="absolute inset-0 z-0 ">
        <P5Wrapper sketch={exampleSketch} />
      </div>


      
    </div>
  );
}
