"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import clubsJson from '@/data/clubs.json';
import type { FeatureCollection } from 'geojson';

const clubs = clubsJson as FeatureCollection; //trypescript crying what is this file!!! -> had to decare it as a feature collection
mapboxgl.accessToken = "pk.eyJ1IjoiamdzbGVlcHdpdGhtZSIsImEiOiJjbWEydDNyZTQxZXBrMmtxeTFqZGQ4MWQ4In0.G3gvAoKzyOHdPUGeRsahng";

const SpinningGlobe = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [address, setAddress] = useState("")
  const [name, setName] = useState("")

  const handleClick = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [5.126769, 52.096782],
        zoom: 15,
        duration: 2000  // zoom
      });
    }
  };

  useEffect(() => {
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

      // create gejson
      map.addSource('center-points', {
        type: 'geojson',
        data: clubs,
      });

      map.addLayer({
        id: 'center-circles',
        type: 'circle',
        source: 'center-points',
        paint: {
          'circle-radius': 10,
          'circle-color': [
            'case',
            ['==', ['get', 'radio'], true],
            '#00FF00',
            '#FF0000'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      map.addLayer({
        id: 'city-labels',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        filter: ['all', //manually select cities
          ['in', 'name_en', 'Amsterdam', 'London', 'Utrecht', 'Berlin', 'Cape Town', 'Lisbon', 'Copenhagen', 'Bristol', 'Manchester', 'Johannesburg',
            'Rotterdam', 'Brussels', 'Paris', 'Cologne', 'Madrid', 'Barcelona', 'Antwerp', 'Dublin', 'Tokyo', 'Rome', 'Milan', 'Prague', 'Leeds'
          ]
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

    map.on('mouseenter', 'center-circles', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'center-circles', () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', 'center-circles', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const location = feature.properties?.address;
        const id = feature.properties?.name;
        setAddress(location);
        setName(id)

      }


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

      <div className="absolute bottom-5 right-5 flex flex-col items-end space-y-2">
        <div className="bg-white bg-opacity-90 text-black p-4 rounded shadow-md min-w-[200px]">
          <p className="font-semibold">
            {/(radio|fm)/i.test(name) ? "Selected Radio" : "Selected Club"}
          </p>
          <p><strong>Name:</strong> {name || "—"}</p>
          <p><strong>Address:</strong> {address || "—"}</p>
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleClick()}
        >
          Zoom
        </button>
      </div>
    </div>
  );
};

export default SpinningGlobe;