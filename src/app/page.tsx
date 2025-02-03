"use client";

import Navigator from "./_components/navigator";
import dynamic from "next/dynamic";
import exampleSketch from "./sketches/exampleSketch";
import ThreeDee from "./_components/object";

const P5Wrapper = dynamic(() => import("../app/_components/P5Wrapper"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="cursor-none">
      <Navigator />

      <ThreeDee />
      <div className="absolute inset-0 z-0 ">
        <P5Wrapper sketch={exampleSketch} />
      </div>
    </div>
  );
}
