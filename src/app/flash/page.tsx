"use client"
import React from "react";
import Navigator from "../_components/navigator";

const Flash: React.FC = () => {
    return (
        <>
        <Navigator/>
            <div className="w-full aspect-video bg-black rounded overflow-hidden shadow-lg flex justify-center items-center">
                <iframe
                    src="https://ruffle-flash.vercel.app/index.html"
                    allowFullScreen
                    className="w-full h-full" />
            </div>
        </>
    )
}

export default Flash