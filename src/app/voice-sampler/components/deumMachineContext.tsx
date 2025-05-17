import React, { createContext, useContext, useRef } from 'react';
import * as Tone from 'tone';

const DrumMachineContext = createContext<any>(null);

export const DrumMachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const transportRef = useRef({
    start: async () => {},
    stop: () => {},
  });

  return (
    <DrumMachineContext.Provider value={transportRef}>
      {children}
    </DrumMachineContext.Provider>
  );
};

export const useDrumMachine = () => useContext(DrumMachineContext);
