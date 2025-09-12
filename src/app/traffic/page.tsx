'use client'
import React, { useState, useEffect } from "react";
import Navigator from "../_components/navigator";
//List for non public use->

//const cameras = [3, 5, 6, 11, 12, 13, 15, 18, 19, 27, 34, 36, 39, 40, 41, 45, 46, 61, 62, 87, 107, 108, 118, 121, 162, 164, 165, 166, 167, 177, 178, 179, 185, 191, 192, 194, 198, 207, 211, 212, 213, 214, 215, 216, 217, 218];

const cameras = [177, 178, 179, 194, 213, 224, 225, 226, 227, 231, 233, 234, 235, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272];
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