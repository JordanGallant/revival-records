'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function Strudel() {
    const [strudelLoaded, setStrudelLoaded] = useState<boolean>(false);
      const iframeRef = useRef<HTMLIFrameElement>(null);

    
      // Your custom Strudel code with Hydra visuals
      const customStrudelCode = `
    await initHydra()
    osc(10, 0.9, 300)
    .color(0.9, 0.7, 0.8)
    .diff(
    osc(45, 0.3, 100)
    .color(0.9, 0.9, 0.9)
    .rotate(0.18)
    .pixelate(12)
    .kaleid()
    )
    .scrollX(10)
    .colorama()
    .luma()
    .repeatX(4)
    .repeatY(4)
    .modulate(
    osc(1, -0.9, 300)
    )
    .scale(2)
    .out()
    
    note("[a,c,e,<a4 ab4 g4 gb4>,b4]/2")
    .s("sawtooth").vib(2)
    .lpf(600).lpa(2).lpenv(6)`;
    
      // Encode the custom code for URL parameter
      const encodedCode = encodeURIComponent(customStrudelCode);
      const strudelUrl = `https://strudel.tidalcycles.org/?code=${encodedCode}&eval=true&zen=false`;


      useEffect(() => {
    // Listen for iframe load events
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = (): void => {
        setStrudelLoaded(true);
        console.log("Strudel REPL loaded with custom code");
      };
      
      iframe.addEventListener('load', handleLoad);
      
      // Cleanup event listener
      return () => {
        iframe.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  // Function to send custom code to Strudel iframe
  const loadCustomCode = (): void => {
    if (iframeRef.current && strudelLoaded && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'code',
          body: customStrudelCode
        }, 'https://strudel.tidalcycles.org');
      } catch (error) {
        console.log("PostMessage not supported, code loaded via URL parameter");
      }
    }
  };

  // Function to toggle Strudel visibility
  const [strudelVisible, setStrudelVisible] = useState<boolean>(true);
  const toggleStrudel = (): void => setStrudelVisible(!strudelVisible);

  return (
    <>
    {/* Strudel REPL with custom code */}
        {strudelVisible && (
          <div className="absolute inset-0 z-20 bg-black/10 backdrop-blur-sm">
            <div className="relative w-full h-full">
              {/* Control buttons */}
              <div className="absolute top-4 right-4 z-30 flex gap-2">
                <button
                  onClick={loadCustomCode}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                >
                  Reload Pattern
                </button>
                <button
                  onClick={toggleStrudel}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Hide Strudel
                </button>
              </div>

              {/* Strudel iframe with custom code pre-loaded */}
              <iframe
                ref={iframeRef}
                src={strudelUrl}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                allow="microphone; clipboard-write; autoplay"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Toggle button when Strudel is hidden */}
        {!strudelVisible && (
          <button
            onClick={toggleStrudel}
            className="absolute top-4 right-4 z-30 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Show Strudel REPL
          </button>
        )}
    
    </>
  )
}
