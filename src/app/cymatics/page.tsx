'use client'
import React, { useState, useEffect, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { type Container, type ISourceOptions } from "@tsparticles/engine";

const Cymatics: React.FC = () => {
    const [init, setInit] = useState(false);
    const [particleSpeed, setParticleSpeed] = useState(4);
    const [particleMove, setParticleMove] = useState(false);
    const [particleDirection, setParticleDirection] = useState("none");
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
                onHover: {
                    enable: true,
                    mode: "repulse",
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
                direction: particleDirection,
                enable: particleMove,
                outModes: {
                    default: "bounce",
                },
                random: false,
                speed: particleSpeed,
                straight: false,
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

    return (
        <>
            {init && (
                <Particles
                    id="tsparticles"
                    particlesLoaded={particlesLoaded}
                    options={options}
                />
            )}
            <div className="absolute top-10 left-10 z-10 text-white">
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
