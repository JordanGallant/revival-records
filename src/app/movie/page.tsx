'use client'
import React, { useState, useEffect } from "react";

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
];

const Movie: React.FC = () => {
    const [currentMovie, setCurrentMovie] = useState(movieUrls[0]);

    // Load a random movie on component mount
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * movieUrls.length);
        setCurrentMovie(movieUrls[randomIndex]);
    }, []);

    const selectRandomMovie = () => {
        const randomIndex = Math.floor(Math.random() * movieUrls.length);
        setCurrentMovie(movieUrls[randomIndex]);
    };

    const selectMovie = (index: number) => {
        setCurrentMovie(movieUrls[index]);
    };

    return (
        <div className="flex flex-col bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="bg-gray-800 p-4">
                <h1 className="text-xl font-bold text-white">Movie Viewer</h1>
                <p className="text-sm text-gray-400">
                    Select a movie or get a random one
                </p>
            </div>

            <div className="flex-1 p-4">
                <div className="flex flex-col items-center mb-4">
                    <h2 className="text-2xl font-bold text-white mb-4">Now showing: {currentMovie.name}</h2>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={selectRandomMovie}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                        >
                            Random Movie
                        </button>

                        {movieUrls.map((movie, index) => (
                            <button
                                key={index}
                                onClick={() => selectMovie(index)}
                                className={`py-2 px-3 rounded text-sm ${movie.name === currentMovie.name
                                    ? 'bg-green-600'
                                    : 'bg-gray-600 hover:bg-gray-700'
                                    } text-white`}
                            >
                                {movie.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-6xl mx-auto aspect-video bg-black rounded overflow-hidden shadow-lg">
                    <iframe
                        src={currentMovie.url}
                        allowFullScreen
                        className="w-full h-full"
                        title={currentMovie.name}
                    />
                </div>
            </div>
        </div>
    );
};

export default Movie;