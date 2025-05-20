'use client'
import React from "react";
import Navigator from "../_components/navigator";
const Synth: React.FC = () => {
    return (
        <>
        <Navigator/>
        <div className="h-screen w-screen ">
                <iframe 
                src="https://sleepy-synth.vercel.app/index.html" 
                style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
            </div>
        </>
    )
}

export default Synth