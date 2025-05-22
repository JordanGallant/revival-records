'use client'
import React from "react"
import Navigator from "../_components/navigator"

const SlingShot: React.FC = () => {
    return (
        <>
        <Navigator/>
        <div className="h-screen w-screen bg-black">
            <iframe src= "https://music-sling.vercel.app/index.html/"
            style={{ width: '100%', height: '100%', border: 'none' }}/>
        </div>
        </>
    )
}

export default SlingShot