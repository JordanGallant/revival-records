'use client'
import React from "react";
import DrumMachineGrid from './components/grid'
import Mic from './components/mic'
import Navigator from "../_components/navigator";
import { DrumMachineProvider } from "./components/deumMachineContext";

const Synth: React.FC = () => {
  // Use MembraneSynth for kick drum-like sound


  return (
    <>
    <DrumMachineProvider>

      <Navigator />
      <div className="flex justify-center align center w-full ">
        <DrumMachineGrid />

      </div>
      <div className="flex justify-center align center w-full pb-5">
        <Mic />
      </div>
      </DrumMachineProvider>
    </>
  );
};

export default Synth;
