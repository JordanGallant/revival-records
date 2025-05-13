"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// Replace this with your real access token
mapboxgl.accessToken = "pk.eyJ1IjoiamdzbGVlcHdpdGhtZSIsImEiOiJjbWEydDNyZTQxZXBrMmtxeTFqZGQ4MWQ4In0.G3gvAoKzyOHdPUGeRsahng";

const SpinningGlobe = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      interactive: true,
      attributionControl: false,
    });

    map.on("style.load", () => {
      map.setFog({});
    

    map.addSource('streets', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8'
      });
      
      map.addLayer({
        id: 'road-major',
        type: 'line',
        source: 'streets',
        'source-layer': 'road',
        filter: ['all', ['==', 'class', 'primary']],
        paint: {
          'line-color': '#ffff00',
          'line-width': 1,
          'line-opacity': 0.6
        }
      });
      
      map.addLayer({
        id: 'place-labels',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        layout: {
          'text-field': ['get', 'name_en'],
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
          'text-max-width': 8
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.75)',
          'text-halo-width': 1.5
        }
      });
      }); //close loading

    // Set cursor to grab when hovering over the map
    map.on("mouseenter", () => {
      if (containerRef.current) containerRef.current.style.cursor = "grab";
    });

    // Change cursor to grabbing during drag
    map.on("mousedown", () => {
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
    });

    map.on("mouseup", () => {
      if (containerRef.current) containerRef.current.style.cursor = "grab";
    });

    map.on("mouseleave", () => {
      if (containerRef.current) containerRef.current.style.cursor = "default";
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default SpinningGlobe;