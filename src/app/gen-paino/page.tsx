'use client'
import React from "react";
import Navigator from "../_components/navigator";

const GenPaino: React.FC = () => {
    return (
        <>
        <Navigator/>
        <div className="h-screen w-screen bg-black">
            <iframe
                src="https://gen-paiano.vercel.app/"
                style={{ width: '100%', height: '100%', border: 'none' }}
            ></iframe>

        </div>
        </>

    )
}
export default GenPaino