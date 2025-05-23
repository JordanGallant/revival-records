'use client'
import React, { useEffect, useState } from "react"
import Navigator from "../_components/navigator";

const flights = [
    { name: 'Donald Trump', hex: 'AA3410', redisKey: 'Trump' },
    { name: 'Kylie Jenner', hex: 'AB0A46', redisKey: 'Kylie' },
    { name: 'Mark Zuckerberg', hex: 'A9247D', redisKey: 'Zuck' },
    { name: 'Drake', hex: 'AA5BC4', redisKey: 'Drake' },
    { name: 'Michael Jordan', hex: 'A21FE6', redisKey: 'MichealJordan' },
    { name: 'Bill Gates', hex: 'AC39D6', redisKey: 'Bill' },
    { name: 'Travis Scott', hex: 'A988EC', redisKey: 'Travis' },
    { name: 'Kim Kardashian', hex: 'A18845', redisKey: 'Kim' }, 
    { name: 'Elon Musk', hex: 'A835AF', redisKey: 'Elon' } 
];

type FlightImage = {
    [hex: string]: string | null;
};

type FlightHistory = {
    date: string;
    distance: {
        num_points: number;
        total_km: number;
        total_miles: number;
    };
    url: string;
};

type FlightData = {
    [key: string]: {
        results: FlightHistory[];
    };
};

const Flights: React.FC = () => {
    const [selectedCeleb, setSelectedCeleb] = useState<string>(flights[0].hex);
    const [images, setImages] = useState<FlightImage>({});
    const [flightData, setFlightData] = useState<FlightData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFlightData() {
            try {
                setLoading(true);
                const res = await fetch('/api/flights');
                const data = await res.json();
                console.log('Flight data from Redis:', data.flightData);
                setFlightData(data.flightData || {});
            } catch (err) {
                console.error('Failed to fetch flight data from Redis', err);
            } finally {
                setLoading(false);
            }
        }

        fetchFlightData();
    }, []);

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

    const selectedFlight = flights.find(flight => flight.hex === selectedCeleb);
    const selectedFlightHistory = selectedFlight ? flightData[selectedFlight.redisKey]?.results || [] : [];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDistance = (km: number, miles: number) => {
        return `${km.toFixed(1)} km (${miles.toFixed(1)} miles)`;
    };

    if (loading) {
        return (
            <>
                <Navigator />
                <div className="p-4 max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading flight data...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navigator />
            <div className="p-4 max-w-6xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
                    {flights.map(({ name, hex }) => (
                        <button
                            key={hex}
                            onClick={() => setSelectedCeleb(hex)}
                            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${
                                selectedCeleb === hex
                                    ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-b-2 border-transparent'
                            }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                {/* Selected Celebrity's Plane */}
                {selectedFlight && (
                    <div className="space-y-6">
                        {/* Plane Image Section */}
                        <div className="bg-white rounded-xl shadow-lg border p-6">
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {selectedFlight.name}'s Private Jet
                                </h1>
                                <p className="text-gray-600">Aircraft Registration: {selectedFlight.hex}</p>
                            </div>
                            
                            <div className="flex justify-center">
                                {images[selectedFlight.hex] ? (
                                    <div className="max-w-4xl w-full">
                                        <img
                                            src={images[selectedFlight.hex]!}
                                            alt={`${selectedFlight.name}'s Private Jet`}
                                            className="w-full h-96 object-cover rounded-lg shadow-md"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full max-w-4xl h-96 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg shadow-md">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                            <p>Loading {selectedFlight.name}'s jet image...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 text-center">
                                <div className="inline-block bg-gray-50 rounded-lg px-4 py-2">
                                    <span className="text-sm text-gray-600">Hex Code: </span>
                                    <span className="font-mono text-sm font-semibold">{selectedFlight.hex}</span>
                                </div>
                            </div>
                        </div>

                        {/* Flight History Section */}
                        <div className="bg-white rounded-xl shadow-lg border p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Flight History
                            </h2>
                            
                            {selectedFlightHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedFlightHistory.map((flight, index) => (
                                        <div 
                                            key={index} 
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <div className="mb-2 sm:mb-0">
                                                    <h3 className="font-semibold text-lg text-gray-800">
                                                        {formatDate(flight.date)}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        Distance: {formatDistance(flight.distance.total_km, flight.distance.total_miles)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Tracking Points: {flight.distance.num_points}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">No flight history available for {selectedFlight.name}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Flights;