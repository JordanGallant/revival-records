'use client'
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import Navigator from "../_components/navigator";

const Gyro: React.FC = () => {
    const qrUrl = "https://gyrodata-htgmebb4dvgmbea6.eastus-01.azurewebsites.net/sender";
    
    return (<>
        <Navigator />
        <div className="h-screen w-screen bg-black">
            <div className="flex justify-center items-center flex-col p-4">
                <QRCodeSVG 
                    value={qrUrl}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                />
                <p className="text-white mt-4 text-center">Scan to connect your phone's gyroscope</p>
            </div>
            <iframe 
                src="https://gyrodata-htgmebb4dvgmbea6.eastus-01.azurewebsites.net/viewer" 
                width="100%" 
                height="100%" 
            />
        </div>
    </>)
}

export default Gyro