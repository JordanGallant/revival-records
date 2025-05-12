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
  const [events, setEvents] = useState<{ 
    title: string; 
    date: string;
    country?: string; 
    flag?: string;
  }[]>([]);  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);

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

  // Fixed function to properly send the artist name as JSON
  const handleArtistSelect = async (artistName: string) => {
    try {
      setSelectedArtist(artistName);
      setIsLoadingEvents(true);

      // Format the artist name as expected by the API
      const artist = artistName.toLowerCase().trim().replace(/\s+/g, '');

      const res = await fetch("/api/scrape-ra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ artistName: artist }),
      });

      if (!res.ok) {
        throw new Error(`Error fetching events: ${res.statusText}`);
      }

      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
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
            {artists.map((artist, index) => {
              const displayName = artist.replace(/-/g, '').replace(/2/g, '');

              return (
                <button
                  key={index}
                  onClick={() => handleArtistSelect(artist)}
                  className={`px-6 py-2 rounded-xl transition ${selectedArtist === artist
                      ? 'bg-white text-black border border-white'
                      : 'bg-black text-white border border-white hover:bg-white hover:text-black'
                    }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>

          {selectedArtist && (
            <div className="text-center mt-8">
              <h2 className="text-xl mb-4">Shows for {selectedArtist.replace(/-/g, '').replace(/2/g, '')}</h2>

              {isLoadingEvents ? (
                <div className="text-center">Loading events...</div>
              ) : events.length > 0 ? (
                <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
                  {events.map((event, idx) => (
                    <div key={idx} className="bg-black/30 backdrop-blur-sm border border-white/20 p-4 rounded-lg w-full">
                      <h3 className="text-lg font-bold">{event.title}</h3>
                      <p className="text-sm">{new Date(event.date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">No upcoming events found for this artist.</div>
              )}
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