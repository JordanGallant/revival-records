'use client';

import React from "react";
import DosGame from "./components/DosGame";
import Navigator from "../_components/navigator";

const Dos: React.FC = () => {
    return (
        <>
        <Navigator/>
        <div className="w-full h-screen flex justify-center items-center">
        <DosGame/>
        </div>
        </>
    )
}

export default Dos
