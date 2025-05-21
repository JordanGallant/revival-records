'use client'
import React, { useState, useEffect } from "react";
import Navigator from "../_components/navigator";

const movieUrls = [
    {
        "name": "Swing Girls",
        "url": "https://vidsrc.xyz/embed/movie/tt0435434"
    },
    {
        "name": "Whiplash",
        "url": "https://vidsrc.xyz/embed/movie/tt2582802"
    },
    {
        "name": "Almost Famous",
        "url": "https://vidsrc.xyz/embed/movie/tt0181875"
    },
]

const Movie: React.FC = () => {
    const [currentMovie, setCurrentMovie] = useState(movieUrls[0]);
    
    // Select random movie on first load
    useEffect(() => {
        selectRandomMovie();
    }, []);
    
    const selectRandomMovie = () => {
        const randomIndex = Math.floor(Math.random() * movieUrls.length);
        setCurrentMovie(movieUrls[randomIndex]);
    };

    return (
        <>
            <Navigator />
            <div className="flex flex-col items-center bg-gray-900 min-h-screen">
                <div className="w-full max-w-6xl px-4 py-6">
                    <div className="flex flex-col items-center mb-4">
                        <h1 className="text-2xl font-bold text-white mb-4">Now showing: {currentMovie.name}</h1>
                        <button 
                            onClick={selectRandomMovie}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-6"
                        >
                            Watch Another Movie
                        </button>
                    </div>
                    <div className="w-full aspect-video bg-black rounded overflow-hidden shadow-lg">
                        <iframe
                            src={currentMovie.url}
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Movie;