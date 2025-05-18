'use client';

import { useEffect, useRef } from 'react';

export default function DosGame() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadJsDos = async () => {

            const observeAndRemove = (selector: string) => {
                const observer = new MutationObserver((mutations, obs) => {
                    const target = document.querySelector(selector);
                    if (target) {
                        target.remove();
                        obs.disconnect(); // Stop observing after successful removal
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            };

            const startDos = () => {
                if (containerRef.current) {
                    const Dos = (window as any).Dos;
                    Dos(containerRef.current, {
                        url: '/jsdos/bundle.jsdos',
                    });

                    // Separate observers for each element
                    observeAndRemove('div.mt-4.flex.flex-col.items-center.gap-2'); // content
                    observeAndRemove('div.sidebar'); // sidebar
                    observeAndRemove('svg.w-10.h-10.absolute.right-0.bottom-0.cursor-pointer');//icon

                }
            };

            if (!(window as any).Dos) {
                const script = document.createElement('script');
                script.src = 'https://v8.js-dos.com/latest/js-dos.js';
                script.onload = () => {
                    startDos();
                };
                document.body.appendChild(script);
            } else {
                startDos();
            }
        };

        loadJsDos();
    }, []);

    return (
        <div
            ref={containerRef}
            id="dos"
            style={{ width: '100%', height: '100%' }}//inherit from parent
        />
    );
}
