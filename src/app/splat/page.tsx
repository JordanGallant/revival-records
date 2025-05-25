'use client'
import React, { useState } from "react"
import Navigator from "../_components/navigator"

const splats = [
    'buggies.splat',
    'car-toyota-white.splat',
    'pot_plant_big.splat',
    'teddy.splat',
    'bonsai.splat' // add bonsai here too
]

const SPLAT_BASE_URL = "https://huggingface.co/VladKobranov/splats/resolve/main/"

const Splat: React.FC = () => {
    const [currentSplat, setCurrentSplat] = useState<string>(splats[0])

    const loadRandomSplat = () => {
        const random = splats[Math.floor(Math.random() * splats.length)]
        setCurrentSplat(random)
    }

    return (
        <>
            <Navigator />
            <div className="h-screen w-screen flex flex-col bg-black">
                <div className="p-2 bg-gray-900 flex justify-between items-center text-white">
                    <span>Current: {currentSplat}</span>
                    <button
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        onClick={loadRandomSplat}
                    >
                        Load Random Splat
                    </button>
                </div>
                <iframe
                    src={`https://splat-renderer.vercel.app/?url=${SPLAT_BASE_URL}${currentSplat}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
            </div>
        </>
    )
}

export default Splat
