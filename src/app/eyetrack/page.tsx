'use client'
import React from "react"

const EyeTrack: React.FC = () => {
    return (
        <>
            <div className="h-screen w-screen bg-black">
                <iframe src="https://monumental-nasturtium-b6223b.netlify.app/"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                >
                </iframe>
            </div>
        </>
    )
}

export default EyeTrack