import React, { createContext, useContext, useRef } from 'react';

const DrumMachineContext = createContext<any>(null);

export const DrumMachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const transportRef = useRef({
    start: async () => {},
    stop: () => {},
    setBpm: (bpm: number) => {},

  });

  return (
    <DrumMachineContext.Provider value={transportRef}>
      {children}
    </DrumMachineContext.Provider>
  );
};

export const useDrumMachine = () => useContext(DrumMachineContext);
