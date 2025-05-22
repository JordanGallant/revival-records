'use client'
import React, { useState, useRef } from "react";
import { FaCamera, FaDownload } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const Graffiti = () => {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const processedCanvasRef = useRef<HTMLCanvasElement>(null);

    // start video
    const startCamera = async () => {
        try {
            setIsCapturing(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setIsCapturing(false);
        }
    };

    // stop video
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCapturing(false);
        }
    };


    //draw letters on canvas
    function drawDetectedLetters(canvas: HTMLCanvasElement, visionData: any) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        const annotations = visionData?.responses?.[0]?.textAnnotations || [];

        // Skip the first entry since it's the full block of text
        for (let i = 1; i < annotations.length; i++) {
            const annotation = annotations[i];
            const wordText = annotation.description;
            const vertices = annotation.boundingPoly?.vertices || [];

            if (vertices.length === 4 && vertices.every(v => v?.x != null && v?.y != null)) {
                const x = vertices[0].x;
                const y = vertices[0].y;

                // Draw the text at top-left corner of bounding box
                ctx.fillText(wordText, x, y);

                // Draw bounding box
                ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let j = 1; j < vertices.length; j++) {
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
    // take a photo
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && processedCanvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const processedCanvas = processedCanvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            processedCanvas.width = video.videoWidth;
            processedCanvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            const processedContext = processedCanvas.getContext("2d");

            if (context && processedContext) {
                // draw og img to both canvases
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                processedContext.drawImage(video, 0, 0, processedCanvas.width, processedCanvas.height);

                // set image 
                const originalImageUrl = canvas.toDataURL("image/png");
                setCapturedImage(originalImageUrl);

                // process second img
                let imageData = processedContext.getImageData(0, 0, 800, 800);
                const pixels = imageData.data;
                //threshold and greyscale
                const threshold = 128;
                for (let i = 0; i < pixels.length; i += 4) {
                    const red = pixels[i];
                    const green = pixels[i + 1];
                    const blue = pixels[i + 2];
                    const brightness = 0.299 * red + 0.587 * green + 0.114 * blue;
                    const value = brightness > threshold ? 255 : 0;
                    pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
                }
                processedContext.putImageData(imageData, 0, 0);

                // 
                const processedImageUrl = processedCanvas.toDataURL("image/png");

                // Remove Base64 prefix
                const base64Data = processedImageUrl.replace(/^data:image\/png;base64,/, "");

                // Send to API route
                fetch("/api/vision", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ image: base64Data }),
                })
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then((data) => {
                        console.log("Full Vision API response:", data);

                        if (canvasRef.current) {
                            // draw on original (unprocessed) canvas
                            drawDetectedLetters(canvasRef.current, data.data);
                            const originalImageUrl = canvasRef.current.toDataURL("image/png");
                            setCapturedImage(originalImageUrl);
                        }


                        const detectedText =
                            data?.data?.responses?.[0]?.fullTextAnnotation?.text || "No text found";


                        console.log("Detected Text:", detectedText);
                    })
                    .catch((error) => {
                        console.error("Error sending to vision API:", error);
                    });

                // Continue processing image & stop camera
                setProcessedImage(processedImageUrl);
                stopCamera();

            }
        }
    };

    //take another photo
    const resetCapture = () => {
        setCapturedImage(null);
        setProcessedImage(null);
        startCamera();
    };

    //will send to google vision api
    const downloadImage = () => {
        if (capturedImage) {
            const link = document.createElement("a");
            link.href = capturedImage;
            link.download = "graffiti-photo.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Graffiti Photo</h1>

            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                {!isCapturing && !capturedImage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button
                            onClick={startCamera}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <FaCamera className="mr-2" size={20} />
                            Open Camera
                        </button>
                    </div>
                )}

                {isCapturing && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}

                {capturedImage && (
                    <img
                        src={capturedImage}
                        alt="Captured photo"
                        className="w-full h-full object-contain"
                    />
                )}

                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={processedCanvasRef} className="hidden" />
            </div>

            <div className="flex flex-wrap justify-center gap-4 w-full">
                {isCapturing && (
                    <button
                        onClick={capturePhoto}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <FaCamera className="mr-2" size={20} />
                        Take Photo
                    </button>
                )}

                {capturedImage && (
                    <>
                        <button
                            onClick={downloadImage}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <FaDownload className="mr-2" size={20} />
                            Download
                        </button>

                        <button
                            onClick={resetCapture}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
                        >
                            <FiRefreshCw className="mr-2" size={20} />
                            New Photo
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Graffiti;