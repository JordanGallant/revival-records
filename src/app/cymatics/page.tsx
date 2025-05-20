'use client'
import React, { useState, useEffect, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import Navigator from "../_components/navigator";



const Cymatics: React.FC = () => {
    const [init, setInit] = useState(false);
    const [particleSpeed, setParticleSpeed] = useState(4);
    const [particleMove, setParticleMove] = useState(false);
    const [particleDirection, setParticleDirection] = useState("none");
    const [frequency, setFrequncy] = useState(110)
    const containerRef = useRef<Container | null>(null);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);

    // Initialize AudioContext and Oscillator
    useEffect(() => {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.connect(ctx.destination);

        audioCtxRef.current = ctx;
        oscillatorRef.current = osc;

        return () => {
            osc.disconnect();
            ctx.close();
        };
    }, []);

    // Initialize tsParticles engine
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = async (container?: Container): Promise<void> => {
        if (container) {
            containerRef.current = container;
        }
    };

    const play = () => {
        if (!audioCtxRef.current) return;

        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }

        if (!oscillatorRef.current) {
            const newOsc = audioCtxRef.current.createOscillator();
            newOsc.type = 'sine';
            newOsc.frequency.setValueAtTime(110, audioCtxRef.current.currentTime);
            newOsc.connect(audioCtxRef.current.destination);
            newOsc.start();

            oscillatorRef.current = newOsc;
        } else {
            try {
                oscillatorRef.current.start();
            } catch (e) {
                console.log("Oscillator already started.");
            }
        }

        const newSpeed = 6;
        setParticleSpeed(newSpeed);
        setParticleMove(true);
        setParticleDirection('top');

        if (containerRef.current) {
            containerRef.current.options.particles.move.speed = newSpeed;
            containerRef.current.refresh();
        }
    };

    const stop = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
            } catch (e) {
                console.log("Oscillator already stopped.");
            }
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
        }

        setParticleSpeed(0);
        setParticleMove(true);
        setParticleDirection('none');

        if (containerRef.current) {
            containerRef.current.options.particles.move.speed = 0;
            containerRef.current.refresh();
        }
    };

    const options: ISourceOptions = {
        background: {
            color: {
                value: "#0d47a1",
            },
        },
        fpsLimit: 120,
        interactivity: {
            events: {
                onClick: {
                    enable: true,
                    mode: "push",
                },
            },
            modes: {
                push: {
                    quantity: 4,
                },
                repulse: {
                    distance: 200,
                    duration: 0.4,
                },
            },
        },
        particles: {
            color: {
                value: "#ffffff",
            },
            move: {
                //@ts-ignore
                direction: particleDirection,
                enable: particleMove,
                outModes: {
                    default: "bounce",
                },
                random: true,
                speed: particleSpeed,
                straight: false,
                warp: true,
                noise: {
                    enable: true,
                    delay: {
                        value: { min: 0.5, max: 1.5 },
                    },
                    clamp: false,
                    generator: "perlin",
                },
                spin: {
                    acceleration: 2,
                    enable: true,
                    position: {
                        x: 50,
                        y: 50,
                    }
                }
            },
            number: {
                density: {
                    enable: true,
                },
                value: 2500,
            },
            opacity: {
                value: 0.5,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 5 },
            },
        },
        detectRetina: true,
    };

    useEffect(() => {
    if (containerRef.current) {
        const mappedSpeed = Math.min(Math.max((frequency - 80) / 150, 1), 10);

        containerRef.current.options.particles.move.speed = mappedSpeed;

        containerRef.current.options.particles.size.value = { min: 1, max: frequency / 50 };
        containerRef.current.options.particles.opacity.value = Math.min(frequency / 1500, 1);

        containerRef.current.refresh();
    }
}, [frequency]);

    return (
        <>
         <div className="z-10 text-white">
        <Navigator/>
        </div>
            {init && (
                <Particles
                    id="tsparticles"
                    particlesLoaded={particlesLoaded}
                    options={options}
                />
            )}
            <div className="absolute top-15 left-10 z-10 text-white">
                <div>
                    <p>Frequency: {frequency}</p>
                    <input
                        type="range"
                        min="80"
                        max="1500"
                        step="1"
                        value={frequency}
                        onChange={(e) => {
                            const newFreq = parseFloat(e.target.value);
                            setFrequncy(newFreq);
                            if (oscillatorRef.current) {
                                oscillatorRef.current.frequency.setValueAtTime(newFreq, audioCtxRef.current!.currentTime);
                            }
                        }}
                    />
                </div>

                <button
                    onClick={play}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Play
                </button>
                <button
                    onClick={stop}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                >
                    Stop
                </button>
            </div>
        </>
    );
};

export default Cymatics;
