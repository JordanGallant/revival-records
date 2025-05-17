'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

const DrumMachineGrid: React.FC = () => {
  const numRows = 8;
  const numCols = 16;
  const labels = ['kick', 'clap', 'blast', 'hi-hat', 'cymbal', 'zap', 'open', '808'];

  //all samples
  const sampleURLs: Record<string, string> = {
    kick: 'https://jordangallant.github.io/samples/kick.mp3',
    clap: 'https://jordangallant.github.io/samples/clap.mp3',
    blast: 'https://jordangallant.github.io/samples/blast.mp3',
    'hi-hat': 'https://jordangallant.github.io/samples/hi-hat.mp3',
    cymbal: 'https://jordangallant.github.io/samples/cymbal.mp3',
    zap: 'https://jordangallant.github.io/samples/zap.mp3',
    open: 'https://jordangallant.github.io/samples/open.mp3',
    '808': 'https://jordangallant.github.io/samples/808.mp3',
  };

  const [grid, setGrid] = useState<boolean[][]>(
    Array.from({ length: numRows }, () => Array(numCols).fill(false))
  );
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);

  const stepRef = useRef(0);
  const gridRef = useRef(grid);
  const playersRef = useRef<Record<string, Tone.Player>>({});

  //allows reference gris in real time
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Load all samples on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const players: Record<string, Tone.Player> = {};

      labels.forEach((label) => {
        const url = sampleURLs[label];
        if (url) {
          players[label] = new Tone.Player({ url, autostart: false }).toDestination();
        }
      });

      playersRef.current = players;
    }
  }, []);

  const toggleCell = (row: number, col: number) => {
    const newGrid = grid.map((r, rowIndex) =>
      r.map((cell, colIndex) => (rowIndex === row && colIndex === col ? !cell : cell))
    );
    setGrid(newGrid);
  };

  const startTransport = async () => {
    await Tone.start();
    if (!isPlaying) {
      Tone.Transport.bpm.value = bpm;

      Tone.Transport.scheduleRepeat((time) => {
        const nextStep = (stepRef.current + 1) % numCols;
        stepRef.current = nextStep;

        // Trigger all active sounds in this step
        labels.forEach((label, rowIndex) => {
          if (gridRef.current[rowIndex][nextStep]) {
            playersRef.current[label]?.start(time);
          }
        });

        setCurrentStep(nextStep);
      }, '4n');

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const stopTransport = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="font-semibold mr-2">BPM:</label>
        <input
          type="range"
          min="60"
          max="180"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-64"
        />
        <span className="ml-2">{bpm}</span>
      </div>

      <div className="flex flex-col gap-1">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center">
            <div className="w-16 text-right pr-2 font-medium">{labels[rowIndex]}</div>
            {row.map((cell, colIndex) => {
              const isActive = cell;
              const isCurrent = colIndex === currentStep;
              return (
                <div
                  key={colIndex}
                  className={`
                    w-8 h-8 border border-gray-400 cursor-pointer 
                    ${isActive ? 'bg-blue-500' : 'bg-gray-100'} 
                    ${isCurrent ? 'ring-2 ring-yellow-400' : ''} 
                    ${(colIndex + 1) % 4 === 0 && colIndex !== numCols - 1 ? 'mr-2' : 'mr-1'}
                  `}
                  onClick={() => toggleCell(rowIndex, colIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 space-x-2">
        <button onClick={startTransport} className="px-4 py-2 bg-green-500 text-white rounded">
          Start
        </button>
        <button onClick={stopTransport} className="px-4 py-2 bg-red-500 text-white rounded">
          Stop
        </button>
      </div>
    </div>
  );
};

export default DrumMachineGrid;
