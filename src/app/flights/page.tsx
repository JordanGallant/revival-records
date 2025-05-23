'use client'
import React, { useEffect, useState } from "react"
import Navigator from "../_components/navigator";

const flights = [
    { name: 'Donald Trump', hex: 'AA3410' },
    { name: 'Kylie Jenner', hex: 'AB0A46' },
    { name: 'Mark Zuckerberg', hex: 'A9247D' },
    { name: 'Drake', hex: 'AA5BC4' },
    { name: 'Michael Jordan', hex: 'A21FE6' },
    { name: 'Bill Gates', hex: 'AC39D6' },
    { name: 'Travis Scott', hex: 'A988EC' }
];

type FlightImage = {
    [hex: string]: string | null;
};

const Flights: React.FC = () => {
    const [images, setImages] = useState<FlightImage>({});

    useEffect(() => {
        flights.forEach(async ({ hex }) => {
            try {
                const res = await fetch(`https://api.planespotters.net/pub/photos/hex/${hex}`);
                const data = await res.json();
                const photo = data.photos?.[0]?.thumbnail_large?.src || null;

                setImages(prev => ({ ...prev, [hex]: photo }));
            } catch (err) {
                console.error(`Failed to fetch image for ${hex}`, err);
                setImages(prev => ({ ...prev, [hex]: null }));
            }
        });
    }, []);

    return (
        <> <Navigator/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {flights.map(({ name, hex }) => (
                <div key={hex} className="rounded-xl shadow-md border p-4">
                    <h2 className="text-lg font-semibold mb-2">{name}</h2>
                    {images[hex] ? (
                        <img
                            src={images[hex]!}
                            alt={`${name}'s Jet`}
                            className="w-full h-60 object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full h-60 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                            No image available
                        </div>
                    )}
                    <p className="text-sm text-gray-600 mt-2">Hex: {hex}</p>
                </div>
            ))}
        </div>
        </>
    );
}

export default Flights;
