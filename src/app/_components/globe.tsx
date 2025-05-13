"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";


mapboxgl.accessToken = "pk.eyJ1IjoiamdzbGVlcHdpdGhtZSIsImEiOiJjbWEydDNyZTQxZXBrMmtxeTFqZGQ4MWQ4In0.G3gvAoKzyOHdPUGeRsahng";

const SpinningGlobe = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [clubs, setClubs] = useState(null);
  const handleClick = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        zoom: 7,
        duration: 2000  // zoom
      });
    }
  };

  useEffect(() => {
    // get clubs list data
    fetch('/clubs.json')
      .then(response => response.json())
      .then(data => {
        setClubs(data);
      })
      .catch(error => console.error('Error fetching clubs:', error));

    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      projection: "globe",
      zoom: 1.5,
      center: [5.126769, 52.096782],
      pitch: 0,
      bearing: 0,
      antialias: true,
      interactive: true,
      attributionControl: false,

    });
    mapRef.current = map;



    map.on("style.load", () => {
      map.setFog({});

      map.addSource('streets', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8'
      });

      map.on('load', function () {
        map.querySourceFeatures('streets', {
          sourceLayer: 'place_label',
          filter: ['has', 'class']
        }).slice(0, 5).forEach(function (feature) {
          console.log(feature.properties);
        });
      });

      map.addLayer({
        id: 'city-labels',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        filter: ['all',
          ['==', ['get', 'class'], 'settlement'],
          ['==', ['get', 'symbolrank'], 6]

        ],
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
    });


    map.on("mouseenter", () => {
      if (containerRef.current) containerRef.current.style.cursor = "grab";
    });

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
      <button
        className="absolute bottom-5 right-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleClick()}
      >
        Zoom
      </button>
    </div>
  );
};

export default SpinningGlobe;