"use client";
import React from "react";
import Navigator from "../_components/navigator";
import dynamic from "next/dynamic";
import Star from "../_components/star";

const HydraCanvas = dynamic(() => import("../shaders/Dance"), {
  ssr: false,
});
const Events: React.FC = () => {
  return (
    <>
      <Navigator />

      <HydraCanvas />

      <div className="relative z-0 min-h-16 w-full flex justify-center items-center text-6xl md:text-9xl font-badeen tracking-[0.2em] mb-16 md:mb-24 text-center px-4">
        <h1>NO EVENTS YET</h1>
      </div>
      <div className="flex">
        <Star />
        <Star />
        <Star />
      </div>
    </>
  );
};

export default Events;
