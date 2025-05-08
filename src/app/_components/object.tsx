"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

// Replace this with your real access token
mapboxgl.accessToken = "pk.eyJ1IjoiamdzbGVlcHdpdGhtZSIsImEiOiJjbWEydDNyZTQxZXBrMmtxeTFqZGQ4MWQ4In0.G3gvAoKzyOHdPUGeRsahng";

const SpinningGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [invertRotation, setInvertRotation] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      projection: "globe",
      zoom: 1.5,
      center: [0, 0],
      pitch: 0,
      bearing: 0,
      antialias: true,
      interactive: true, // Enable mouse interaction
      attributionControl: false, // hide default attribution UI

    });

    map.on("style.load", () => {
      map.setFog({});
    });

    let bearing = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isDragging) {
        bearing += invertRotation ? -0.1 : 0.1;
        map.setBearing(bearing % 360);
      }
    };

    animate();

    // Pause auto-rotation while dragging
    map.on("dragstart", () => {
      setIsDragging(true);
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    });

    map.on("dragend", () => {
      setIsDragging(false);
      if (containerRef.current) containerRef.current.style.cursor = "grab";
    });

    map.on("mouseenter", () => {
      if (!isDragging && containerRef.current) containerRef.current.style.cursor = "grab";
    });

    map.on("mouseleave", () => {
      if (containerRef.current) containerRef.current.style.cursor = "default";
    });

    return () => {
      cancelAnimationFrame(animationId);
      map.remove();
    };
  }, [invertRotation, isDragging]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default SpinningGlobe;
