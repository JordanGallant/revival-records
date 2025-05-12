"use client";
import React, { useEffect, useState } from "react";
import Navigator from "../_components/navigator";
import dynamic from "next/dynamic";
import Star from "../_components/star";

const HydraCanvas = dynamic(() => import("../shaders/Dance"), {
  ssr: false,
});

const Events: React.FC = () => {
  const [artists, setArtists] = useState<string[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/artists");
        
        if (!res.ok) {
          throw new Error('Failed to fetch artists');
        }
        
        const data = await res.json();
        setArtists(data.artists); // Note the .artists here to match the API response
        setError(null);
      } catch (err) {
        console.error("Failed to fetch artists:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleArtistSelect = (artistName: string) => {
    setSelectedArtist(artistName.toLowerCase().trim().replace(/\s+/g, ''));
  };

  return (
    <>
      <Navigator />
      <HydraCanvas />

      <div className="relative z-0 min-h-16 w-full flex justify-center items-center text-6xl md:text-9xl font-badeen tracking-[0.2em] mb-16 md:mb-24 text-center px-4">
        <h1>Upcoming EVENTS</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center text-xl">Loading artists...</div>
      ) : error ? (
        <div className="flex justify-center text-xl text-red-500">{error}</div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-4 px-4">
            {artists.map((artist, index) => (
              <button
                key={index}
                onClick={() => handleArtistSelect(artist)}
                className={`
                  px-6 py-2 rounded-xl transition
                  ${selectedArtist === artist 
                    ? 'bg-white text-black border border-black' 
                    : 'bg-black text-white border border-white'}
                  hover:bg-white hover:text-black
                `}
              >
                {artist}
              </button>
            ))}
          </div>

          {selectedArtist && (
            <div className="text-center mt-8 text-xl">
              Selected Artist: {selectedArtist}
            </div>
          )}
        </>
      )}

      <div className="flex justify-center mt-12">
        <Star />
        <Star />
        <Star />
      </div>
    </>
  );
};

export default Events;