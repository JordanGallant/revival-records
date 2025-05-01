"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import LogRocket from "logrocket";
import Navigator from "./_components/navigator";
import exampleSketch from "./sketches/exampleSketch";
import ThreeDee from "./_components/object";
import Spotify from "./_components/spotify";

const P5Wrapper = dynamic(() => import("../app/_components/P5Wrapper"), {
  ssr: false,
});

export default function Home() {
  useEffect(() => {
    LogRocket.init("biv3ve/revival-records");
  }, []);

  return (
    <>
      <div className="cursor-none relative w-full h-full min-h-screen">
        <Navigator />
        <P5Wrapper sketch={exampleSketch} />
        <div className="absolute inset-0 z-0 ">
          <ThreeDee />
        </div>
      </div>
      <div className="w-full h-screen">
        <Spotify />
      </div>
    </>
  );
}
