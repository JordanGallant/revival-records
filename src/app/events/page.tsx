"use client";
import React, { useEffect } from "react";
import Navigator from "../_components/navigator";
import dynamic from "next/dynamic";
import Star from "../_components/star";


const HydraCanvas = dynamic(() => import("../shaders/Dance"), {
  ssr: false,
});
const Events: React.FC = () => {
  useEffect(() => {
    const fetchRA = async () => {
      try {
        const res = await fetch("/api/scrape-ra");
        const data = await res.json();
        console.log("RA response:", data); // <-- Logs the response to the browser console
      } catch (err) {
        console.error("Error fetching RA data:", err);
      }
    };

    fetchRA();
  }, []);

  return (
    <>
      <Navigator />

      <HydraCanvas />

      <div className="relative z-0 min-h-16 w-full flex justify-center items-center text-6xl md:text-9xl font-badeen tracking-[0.2em] mb-16 md:mb-24 text-center px-4">
        <h1>Upcomming EVENTS</h1>
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
