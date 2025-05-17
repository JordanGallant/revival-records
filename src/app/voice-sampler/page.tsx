'use client'
import React from "react";
import DrumMachineGrid from './components/grid'
import Mic from './components/mic'
import Navigator from "../_components/navigator";

const Synth: React.FC = () => {
  // Use MembraneSynth for kick drum-like sound


  return (
    <>
      <Navigator />
      <div className="flex justify-center align center w-full ">
        <DrumMachineGrid />

      </div>
      <div className="flex justify-center align center w-full pb-5">
        <Mic />
      </div>
    </>
  );
};

export default Synth;
