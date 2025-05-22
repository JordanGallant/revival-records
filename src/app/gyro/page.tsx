'use client'
import React from "react";
import Navigator from "../_components/navigator";
const Gyro: React.FC = () => {
    return (<>
        <Navigator />
        <div className="h-screen w-screen bg-black">
            <div className="flex justify-center items-center">
                <img className="w-[150px] h-[150px]" src="https://i.ibb.co/BK3YvjD3/Screenshot-2025-05-22-at-11-14-00.png" alt="Screenshot-2025-05-22-at-11-14-00"></img>
                <p>Scan to connect your phone's gyroscope</p>

            </div>
            <iframe src="https://mobile-gyro-data.onrender.com/viewer" width="100%" height="100%" ></iframe>
        </div>
    </>)
}

export default Gyro