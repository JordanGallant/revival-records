'use client'
import React, { useState, useEffect } from "react";
import Navigator from "../_components/navigator";

const cameras = [177, 178, 179, 194, 211, 212, 213, 214, 215, 216, 217, 218];

const Movie: React.FC = () => {
    const [currentCamera, setCurrentCamera] = useState(cameras[0]);
    
    // Select random camera on first load
    useEffect(() => {
        selectRandomCamera();
    }, []);
    
    const selectRandomCamera = () => {
        const randomIndex = Math.floor(Math.random() * cameras.length);
        setCurrentCamera(cameras[randomIndex]);
    };

    return (
        <>
            <Navigator />
            <div className="flex flex-col items-center bg-gray-900 min-h-screen">
                <div className="w-full max-w-6xl px-4 py-6">
                    <div className="flex flex-col items-center mb-4">
                        <button 
                            onClick={selectRandomCamera}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mb-6"
                        >
                            Watch Another Camera
                        </button>
                    </div>
                    <div className="w-full aspect-video bg-black rounded overflow-hidden shadow-lg">
                        <iframe
                            src={`https://stream.inmoves.nl/${currentCamera}/embed`}
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