'use client'
import React, { useState } from "react";
import Navigator from "../_components/navigator";

const Hallucinate: React.FC = () => {
    const [email, setEmail] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result as string;
                // Remove the data:image/jpeg;base64, prefix
                const base64Data = base64String.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email || !image) {
            setError("Please provide both email and image");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const base64Image = await convertToBase64(image);
            
            const response = await fetch("/api/hallucinate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    image: base64Image,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <Navigator/>
        <div className="p-4 space-y-4 max-w-md mx-auto">
            <div className="text-xl font-semibold">Hallucinate:</div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Input */}
                <div>
                    <label className="block mb-2 font-medium" htmlFor="imageUpload">
                        Upload an Image:
                    </label>
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                    />
                    {image && (
                        <p className="mt-1 text-sm text-gray-600">
                            Selected: {image.name}
                        </p>
                    )}
                </div>

                {/* Email Input */}
                <div>
                    <label className="block mb-2 font-medium" htmlFor="email">
                        Enter your Email:
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !email || !image}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : "Submit"}
                </button>
            </form>

            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {result && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <h3 className="font-semibold mb-2">Result:</h3>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
        </>
    );
};

export default Hallucinate;