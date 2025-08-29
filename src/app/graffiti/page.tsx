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

    //draw letters on canvas (Azure Vision response)
    function drawDetectedLetters(canvas: HTMLCanvasElement, visionData: any) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        const readResults = visionData?.analyzeResult?.readResults || [];

        for (const page of readResults) {
            for (const line of page.lines) {
                const { text, boundingBox } = line;
                if (boundingBox?.length === 8) {
                    const [x1, y1, x2, y2, x3, y3, x4, y4] = boundingBox;

                    // Draw text at top-left corner
                    ctx.fillText(text, x1, y1);

                    // Draw bounding box
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.lineTo(x4, y4);
                    ctx.closePath();
                    ctx.stroke();
                }
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
                // draw original image to both canvases
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                processedContext.drawImage(video, 0, 0, processedCanvas.width, processedCanvas.height);

                // set image 
                const originalImageUrl = canvas.toDataURL("image/png");
                setCapturedImage(originalImageUrl);

                // process second img (binarize)
                let imageData = processedContext.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
                const pixels = imageData.data;
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

                const processedImageUrl = processedCanvas.toDataURL("image/png");

                // Remove Base64 prefix
                const base64Data = processedImageUrl.replace(/^data:image\/png;base64,/, "");

                // Send to API route (Azure Vision)
                fetch("/api/vision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64Data }),
                })
                    .then((res) => {
                        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                        return res.json();
                    })
                    .then((data) => {
                        console.log("Full Azure Vision response:", data);

                        if (canvasRef.current) {
                            // draw on original (unprocessed) canvas
                            drawDetectedLetters(canvasRef.current, data.data);
                            const updatedUrl = canvasRef.current.toDataURL("image/png");
                            setCapturedImage(updatedUrl);
                        }

                        // Extract all detected text
                        const detectedText = data?.data?.analyzeResult?.readResults
                            ?.map((page: any) => page.lines.map((line: any) => line.text).join(" "))
                            .join("\n") || "No text found";

                        console.log("Detected Text:", detectedText);
                    })
                    .catch((error) => {
                        console.error("Error sending to Azure Vision API:", error);
                    });

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

    // download image
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
