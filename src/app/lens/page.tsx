'use client'
import React, { useEffect, useRef, useState, useCallback } from "react"
import Navigator from "../_components/navigator"

interface LensConfig {
  id: string
  name: string
  fallback?: boolean
}

const CameraKitLens: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBackCamera, setIsBackCamera] = useState(false)
  const [currentLens, setCurrentLens] = useState<any>(null)
  const [availableLenses, setAvailableLenses] = useState<any[]>([])
  const [currentLensIndex, setCurrentLensIndex] = useState(0)

  const sessionRef = useRef<any>(null)
  const sourceRef = useRef<any>(null)
  const cameraKitRef = useRef<any>(null)

  // Enhanced lens configuration with names for better UX
  const LENS_CONFIGS: LensConfig[] = [
    { id: "a3e01c31-c1d4-44da-a811-ee19d326d522", name: "Primary Effect" },
    { id: "43281170875", name: "Color Filter" },
    { id: "40369030925", name: "Face Mask" },
    { id: "43293650876", name: "Background Effect" },
    { id: "43300180875", name: "Animation" },
    { id: "50502080875", name: "Fallback", fallback: true }
  ]

  const GROUP_ID = "0a575a9d-69ce-42b6-886d-d5f81ddb7123"
  const API_TOKEN = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzQ4MjAzMzk4LCJzdWIiOiJlZjk3OWM5OC1jMzQ2LTQyMDEtOGY1Zi1hM2UzMTZjOTBlZGV-U1RBR0lOR343NWVhNjljNC1hOTY3LTRjZGItOTRjNC02ZGRhMmM4ZTA3YmUifQ.6-kdHtEGmgAoUfPkLLhmfc1Zs8BHjtA-1lyB90CWhWw"

  // Cleanup function with better error handling
  const cleanup = useCallback(() => {
    try {
      if (sessionRef.current) {
        sessionRef.current.pause?.()
        sessionRef.current.destroy?.()
        sessionRef.current = null
      }
      if (sourceRef.current) {
        sourceRef.current.destroy?.()
        sourceRef.current = null
      }
    } catch (err) {
      console.warn("Cleanup error:", err)
    }
  }, [])

  useEffect(() => {
    initializeCameraKit()
    return cleanup
  }, [cleanup])

  const initializeCameraKit = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const {
        bootstrapCameraKit,
        createMediaStreamSource,
        Transform2D
      } = await import("@snap/camera-kit")

      const cameraKit = await bootstrapCameraKit({ apiToken: API_TOKEN })
      cameraKitRef.current = cameraKit

      const session = await cameraKit.createSession()
      sessionRef.current = session

      const container = containerRef.current
      if (!container) throw new Error("Container element not found")
      
      // Clear container and set up output
      container.innerHTML = ""
      container.appendChild(session.output.live)

      await setupCamera(session, createMediaStreamSource, Transform2D)
      await loadAllLenses(session, cameraKit)

      await session.play()
      setIsLoading(false)
    } catch (err: any) {
      console.error("CameraKit initialization failed:", err)
      setError(err.message || "Failed to initialize camera")
      setIsLoading(false)
    }
  }

  const setupCamera = async (session: any, createMediaStreamSource: any, Transform2D: any) => {
    try {
      // Clean up previous source
      if (sourceRef.current) {
        sourceRef.current.destroy?.()
        sourceRef.current = null
      }

      const constraints = {
        video: { 
          facingMode: isBackCamera ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      const source = createMediaStreamSource(
        stream,
        isBackCamera
          ? { cameraType: "back" }
          : { cameraType: "front", transform: Transform2D.MirrorX }
      )

      sourceRef.current = source
      await session.setSource(source)
      
      // Set render size to match container
      const container = containerRef.current
      if (container) {
        session.source.setRenderSize(container.clientWidth, container.clientHeight)
      }
    } catch (err: any) {
      throw new Error(`Camera setup failed: ${err.message}`)
    }
  }

  const loadAllLenses = async (session: any, cameraKit: any) => {
    const loadedLenses: any[] = []
    
    for (const lensConfig of LENS_CONFIGS) {
      try {
        const lens = await cameraKit.lensRepository.loadLens(lensConfig.id, GROUP_ID)
        if (lens) {
          lens.config = lensConfig // Store config for reference
          loadedLenses.push(lens)
        }
      } catch (err) {
        console.warn(`Failed to load lens ${lensConfig.name} (${lensConfig.id}):`, err)
      }
    }

    setAvailableLenses(loadedLenses)
    
    // Apply first available lens
    if (loadedLenses.length > 0) {
      await session.applyLens(loadedLenses[0])
      setCurrentLens(loadedLenses[0])
      setCurrentLensIndex(0)
    } else {
      console.warn("No lenses could be loaded")
      setError("No AR lenses are available")
    }
  }

  const switchCamera = async () => {
    if (!sessionRef.current || isLoading) return
    
    try {
      setIsLoading(true)
      setIsBackCamera(prev => !prev)
      
      const { createMediaStreamSource, Transform2D } = await import("@snap/camera-kit")
      await setupCamera(sessionRef.current, createMediaStreamSource, Transform2D)
      
      setIsLoading(false)
    } catch (err: any) {
      console.error("Camera switch failed:", err)
      setError("Failed to switch camera")
      setIsLoading(false)
    }
  }

  const switchToNextLens = async () => {
    if (!sessionRef.current || availableLenses.length === 0 || isLoading) return

    try {
      const nextIndex = (currentLensIndex + 1) % availableLenses.length
      const nextLens = availableLenses[nextIndex]
      
      await sessionRef.current.applyLens(nextLens)
      setCurrentLens(nextLens)
      setCurrentLensIndex(nextIndex)
    } catch (err: any) {
      console.error("Lens switch failed:", err)
      setError("Failed to switch lens")
    }
  }

  const toggleLens = async () => {
    if (!sessionRef.current) return
    
    try {
      if (currentLens) {
        await sessionRef.current.clearLens()
        setCurrentLens(null)
      } else if (availableLenses.length > 0) {
        const lens = availableLenses[currentLensIndex]
        await sessionRef.current.applyLens(lens)
        setCurrentLens(lens)
      }
    } catch (err: any) {
      console.error("Lens toggle failed:", err)
      setError("Failed to toggle lens")
    }
  }

  // Error state
  if (error) {
    return (
      <>
        <Navigator />
        <div className="h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Camera Kit Error</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setCurrentLens(null)
                setAvailableLenses([])
                initializeCameraKit()
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  const currentLensName = currentLens?.config?.name || "No Lens"

  return (
    <>
      <Navigator />
      <div className="h-screen w-screen relative bg-black overflow-hidden">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-white text-center">
              <div className="animate-spin border-4 border-white border-t-transparent rounded-full w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Loading AR Experience...</p>
              <p className="text-sm text-gray-300 mt-1">Please allow camera access</p>
            </div>
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-start">
          <div className="flex gap-2">
            <button 
              onClick={switchCamera} 
              disabled={isLoading}
              className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20 hover:bg-black/60 transition-all disabled:opacity-50"
            >
              🔄 {isBackCamera ? 'Front' : 'Back'}
            </button>
            
            <button 
              onClick={toggleLens} 
              disabled={isLoading || availableLenses.length === 0}
              className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20 hover:bg-black/60 transition-all disabled:opacity-50"
            >
              {currentLens ? "❌ Remove" : "🎭 Apply"}
            </button>

            {availableLenses.length > 1 && (
              <button 
                onClick={switchToNextLens} 
                disabled={isLoading || !currentLens}
                className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20 hover:bg-black/60 transition-all disabled:opacity-50"
              >
                ➡️ Next
              </button>
            )}
          </div>

          {/* Current lens indicator */}
          {currentLens && (
            <div className="bg-black/40 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-full border border-white/20">
              🎭 {currentLensName}
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 z-40 flex justify-between items-end">
          <div className="bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20">
            {availableLenses.length} lens{availableLenses.length !== 1 ? 'es' : ''} loaded
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-full border border-white/20">
            Powered by Snap Camera Kit
          </div>
        </div>

        {/* Camera output container */}
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </>
  )
}

export default CameraKitLens