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

type FlightPosition = {
    latitude: number;
    longitude: number;
    altitude: string;
    formatted_time: string;
    timestamp: number;
};

type FlightHistory = {
    date: string;
    distance: {
        num_points: number;
        total_km: number;
        total_miles: number;
    };
    emissions: {
        aircraft_category: string;
        aircraft_name: string;
        aircraft_type: string;
        co2_emissions_kg: number;
        co2_emissions_tons: number;
        co2_per_km: number;
        co2_per_mile: number;
        estimated_fuel_consumed_gallons: number;
        flight_time_hours: number;
        fuel_consumption_gph: number;
    };
    positions: {
        end: FlightPosition;
        start: FlightPosition;
    };
};

type FlightData = {
    [key: string]: {
        summary: any;
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

    const formatTimeFromSeconds = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        // Pad with zeros to ensure two digits
        const pad = (n: number) => String(n).padStart(2, '0');

        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    };

    const formatDistance = (km: number, miles: number) => {
        return `${km.toFixed(1)} km (${miles.toFixed(1)} miles)`;
    };

    const formatCoordinates = (lat: number, lng: number) => {
        return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
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
                            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${selectedCeleb === hex
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

                        {/* Flight Summary Section */}
                        {selectedFlight && flightData[selectedFlight.redisKey]?.summary && (
                            <div className="bg-white rounded-xl shadow-lg border p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Flight Summary</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-700">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {flightData[selectedFlight.redisKey]!.summary!.total_flights}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Flights</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {flightData[selectedFlight.redisKey]!.summary!.successful_flights}
                                        </div>
                                        <div className="text-sm text-gray-600">Successful Flights</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {flightData[selectedFlight.redisKey]!.summary!.processed_limit}
                                        </div>
                                        <div className="text-sm text-gray-600">Processed Limit</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="text-lg font-bold text-purple-600">
                                            {formatDistance(
                                                flightData[selectedFlight.redisKey]!.summary!.total_distance_km,
                                                flightData[selectedFlight.redisKey]!.summary!.total_distance_miles
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Distance</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Flight History Section */}
                        <div className="bg-white rounded-xl shadow-lg border p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Flight History</h2>
                                <a href="https://t.me/celeb_jet_tracking_bot"
                                    className="text-blue-500 hover:text-blue-700 underline">
                                    Telegram Bot
                                </a>
                            </div>

                            {selectedFlightHistory.length > 0 ? (
                                <div className="space-y-6">
                                    {selectedFlightHistory.map((flight, index) => (
                                        <div
                                            key={index}
                                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            {/* Flight Date and Basic Info */}
                                            <div className="mb-4">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {formatDate(flight.date)}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Distance:</span>
                                                        <div className="text-gray-800">{formatDistance(flight.distance.total_km, flight.distance.total_miles)}</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Flight Time:</span>
                                                        <div className="text-gray-800">{flight.emissions.flight_time_hours.toFixed(2)} hours</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Tracking Points:</span>
                                                        <div className="text-gray-800">{flight.distance.num_points}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Aircraft Information */}
                                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                                <h4 className="font-semibold text-gray-800 mb-2">Aircraft Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Aircraft Name:</span>
                                                        <div className="text-gray-800">{flight.emissions.aircraft_name}</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Aircraft Type:</span>
                                                        <div className="text-gray-800">{flight.emissions.aircraft_type}</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Category:</span>
                                                        <div className="text-gray-800">{flight.emissions.aircraft_category}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Emissions Data */}
                                            <div className="mb-4 p-4 bg-red-50 rounded-lg">
                                                <h4 className="font-semibold text-gray-800 mb-2">Environmental Impact</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-600">CO₂ Emissions:</span>
                                                        <div className="text-gray-800">{flight.emissions.co2_emissions_tons.toFixed(2)} tons</div>
                                                        <div className="text-xs text-gray-500">({flight.emissions.co2_emissions_kg.toFixed(0)} kg)</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">CO₂ per Distance:</span>
                                                        <div className="text-gray-800">{flight.emissions.co2_per_km.toFixed(2)} kg/km</div>
                                                        <div className="text-xs text-gray-500">({flight.emissions.co2_per_mile.toFixed(2)} kg/mile)</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Fuel Consumed:</span>
                                                        <div className="text-gray-800">{flight.emissions.estimated_fuel_consumed_gallons.toFixed(0)} gallons</div>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Fuel Rate:</span>
                                                        <div className="text-gray-800">{flight.emissions.fuel_consumption_gph.toFixed(1)} GPH</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Flight Positions */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                {/* Departure */}
                                                <div className="p-4 bg-green-50 rounded-lg">
                                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                        Departure
                                                    </h4>
                                                    <div className="text-sm space-y-1">
                                                        <div>
                                                            <span className="font-medium text-gray-600">Time:</span>
                                                            <div className="text-gray-800">{formatTimeFromSeconds(flight.positions.start.timestamp)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-600">Location:</span>
                                                            <div className="text-gray-800">{formatCoordinates(flight.positions.start.latitude, flight.positions.start.longitude)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-600">Altitude:</span>
                                                            <div className="text-gray-800">{flight.positions.start.altitude}</div>
                                                        </div>
                                                        <div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Arrival */}
                                                <div className="p-4 bg-blue-50 rounded-lg">
                                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                                        Arrival
                                                    </h4>
                                                    <div className="text-sm space-y-1">
                                                        <div>
                                                            <span className="font-medium text-gray-600">Time:</span>
                                                            <div className="text-gray-800">{formatTimeFromSeconds(flight.positions.end.timestamp)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-600">Location:</span>
                                                            <div className="text-gray-800">{formatCoordinates(flight.positions.end.latitude, flight.positions.end.longitude)}</div>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-600">Altitude:</span>
                                                            <div className="text-gray-800">{flight.positions.end.altitude}</div>
                                                        </div>
                                                        <div>
                                                        </div>
                                                    </div>
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