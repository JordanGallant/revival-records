'use client';
import Navigator from '../_components/navigator';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IoLocationSharp } from "react-icons/io5";


// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiamdzbGVlcHdpdGhtZSIsImEiOiJjbWEydDNyZTQxZXBrMmtxeTFqZGQ4MWQ4In0.G3gvAoKzyOHdPUGeRsahng';

interface RoutePoint {
    lng: number;
    lat: number;
}

const Strainva: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [lng, setLng] = useState(-74.5);
    const [lat, setLat] = useState(40);
    const [zoom, setZoom] = useState(9);
    const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
    const [isPathSnapped, setIsPathSnapped] = useState(false);
    const [isSnapping, setIsSnapping] = useState(false);

    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState('00:00:00');
    const [pace, setPace] = useState('0:00');
    const [sliderValue, setSliderValue] = useState(5); // Default pace in min/km

    // Form state
    const [activityName, setActivityName] = useState('Afternoon Run');
    const [activityType, setActivityType] = useState('Running');
    const [activityDateTime, setActivityDateTime] = useState(new Date().toISOString().slice(0, 16));
    const [activityDescription, setActivityDescription] = useState('');

    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (map.current) return; // initialize map only once

        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [lng, lat],
                zoom: zoom
            });

            map.current.on('load', () => {
                console.log('Map loaded successfully');

                // Add a source for the route line
                map.current!.addSource('route', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': []
                        }
                    }
                });

                // Add a layer for the route line
                map.current!.addLayer({
                    'id': 'route',
                    'type': 'line',
                    'source': 'route',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#ea580c',
                        'line-width': 4
                    }
                });
            });

            map.current.on('move', () => {
                if (map.current) {
                    setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
                    setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
                    setZoom(parseFloat(map.current.getZoom().toFixed(2)));
                }
            });

            // Add click handler for adding points
            map.current.on('click', (e) => {
                console.log('Map clicked', { coordinates: e.lngLat });

                const newPoint: RoutePoint = {
                    lng: e.lngLat.lng,
                    lat: e.lngLat.lat
                };

                console.log('Adding new point:', newPoint);
                console.log('Longitude:', newPoint.lng);
                console.log('Latitude:', newPoint.lat);

                setRoutePoints(prev => {
                    const updated = [...prev, newPoint];
                    console.log('Updated route points:', updated);

                    // Reset path snapped state when adding new points
                    setIsPathSnapped(false);

                    // Update the route line on the map with straight lines
                    updateRouteLine(updated);

                    return updated;
                });

                // Create and add marker
                const marker = new mapboxgl.Marker({
                    color: '#ea580c' // Orange color
                })
                    .setLngLat([e.lngLat.lng, e.lngLat.lat])
                    .addTo(map.current!);

                // Store marker reference for cleanup
                markersRef.current.push(marker);

                console.log('Marker added at:', [e.lngLat.lng, e.lngLat.lat]);
                console.log('Total markers:', markersRef.current.length);
            });
        }
    }, []); // Remove dependencies

    const calculateDistance = (points: RoutePoint[]): number => {
        if (points.length < 2) return 0;

        let totalDistance = 0;

        for (let i = 1; i < points.length; i++) {
            const prevPoint = points[i - 1];
            const currentPoint = points[i];

            // Haversine formula to calculate distance between two lat/lng points
            const R = 6371; // Earth's radius in kilometers
            const dLat = (currentPoint.lat - prevPoint.lat) * Math.PI / 180;
            const dLng = (currentPoint.lng - prevPoint.lng) * Math.PI / 180;

            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(prevPoint.lat * Math.PI / 180) * Math.cos(currentPoint.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const segmentDistance = R * c;

            totalDistance += segmentDistance;
        }

        return totalDistance;
    };

    const updatePaceAndDuration = (paceMinPerKm: number, distanceKm: number) => {
        if (distanceKm > 0) {
            // Calculate total duration in minutes
            const totalMinutes = paceMinPerKm * distanceKm;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor(totalMinutes % 60);
            const seconds = Math.round((totalMinutes % 1) * 60);

            setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            // Format pace
            const paceMinutes = Math.floor(paceMinPerKm);
            const paceSeconds = Math.round((paceMinPerKm - paceMinutes) * 60);
            setPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`);
        } else {
            setDuration('00:00:00');
            setPace('0:00');
        }
    };

    useEffect(() => {
        updatePaceAndDuration(sliderValue, distance);
    }, [sliderValue, distance]);

    const updateRouteLine = (points: RoutePoint[]) => {
        if (map.current && map.current.getSource('route')) {
            const coordinates = points.map(point => [point.lng, point.lat]);

            const geojson = {
                'type': 'Feature' as const,
                'properties': {},
                'geometry': {
                    'type': 'LineString' as const,
                    'coordinates': coordinates
                }
            };

            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);

            // Calculate and update distance
            const totalDistance = calculateDistance(points);
            setDistance(parseFloat(totalDistance.toFixed(2)));

            console.log('Route line updated with', coordinates.length, 'points');
            console.log('Total distance:', totalDistance.toFixed(2), 'km');
        }
    };

    const snapToPath = async () => {
        if (routePoints.length < 2) return;

        setIsSnapping(true);

        try {
            // Create coordinate string for Mapbox Directions API
            const coordinates = routePoints
                .map(point => `${point.lng},${point.lat}`)
                .join(';');

            // Use Mapbox Directions API to get walking/running route
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch directions');
            }

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routeCoordinates = route.geometry.coordinates;

                // Update the map with the snapped route
                const geojson = {
                    'type': 'Feature' as const,
                    'properties': {},
                    'geometry': {
                        'type': 'LineString' as const,
                        'coordinates': routeCoordinates
                    }
                };

                if (map.current && map.current.getSource('route')) {
                    (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson);
                }

                // Just set the distance, let the slider control pace and duration
                const routeDistanceKm = route.distance / 1000;
                setDistance(parseFloat(routeDistanceKm.toFixed(2)));

                setIsPathSnapped(true);
                console.log('Route snapped to path successfully');
                console.log('Snapped route distance:', routeDistanceKm.toFixed(2), 'km');
            } else {
                throw new Error('No route found');
            }
        } catch (error) {
            console.error('Error snapping to path:', error);
            alert('Failed to snap route to path. Please try again.');
        } finally {
            setIsSnapping(false);
        }
    };

    const generateGPXContent = (points: RoutePoint[], activityName: string, activityType: string, dateTime: string) => {
        const startTime = new Date(dateTime).toISOString();
        
        // Generate track points with timestamps
        const trackPoints = points.map((point, index) => {
            // Calculate time for each point based on pace and cumulative distance
            const timeOffset = index * (sliderValue * 60 * 1000); // Convert pace to milliseconds per point
            const pointTime = new Date(new Date(dateTime).getTime() + timeOffset).toISOString();
            
            return `      <trkpt lat="${point.lat.toFixed(6)}" lon="${point.lng.toFixed(6)}">
        <time>${pointTime}</time>
      </trkpt>`;
        }).join('\n');

        return `<?xml version="1.0" encoding="utf-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Strainva">
  <metadata>
    <time>${startTime}</time>
  </metadata>
  <trk>
    <name>${activityName}</name>
    <type>${activityType.toLowerCase()}</type>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`;
    };

    const downloadGPX = () => {
        if (routePoints.length < 2) {
            alert('Please add at least 2 points to create a route');
            return;
        }

        const gpxContent = generateGPXContent(routePoints, activityName, activityType, activityDateTime);
        
        // Create and download file
        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activityName.replace(/[^a-zA-Z0-9]/g, '_')}.gpx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    const clearRoute = () => {
        setRoutePoints([]);
        setDistance(0);
        setDuration('00:00:00');
        setPace('0:00');
        setSliderValue(5); // Reset to default pace
        setActivityName('Afternoon Run');
        setActivityType('Running');
        setActivityDateTime(new Date().toISOString().slice(0, 16));
        setActivityDescription('');
        setIsPathSnapped(false);
        clearMarkers();
        updateRouteLine([]);
    };

    return (
        <>
            <Navigator />
            <div className="min-h-screen bg-gray-50">
                <div className="flex h-screen">
                    <div className="w-80 bg-white shadow-lg overflow-y-auto">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-orange-600 pb-10">Strainva</h1>
                            <div className="space-y-4 mb-6">
                                {routePoints.length >= 2 && !isPathSnapped && (
                                    <button
                                        onClick={snapToPath}
                                        disabled={isSnapping}
                                        className="w-full px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    >
                                        {isSnapping ? 'Snapping to Path...' : 'Set to Path'}
                                    </button>
                                )}

                                <button
                                    onClick={clearRoute}
                                    className="w-full px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                                >
                                    Clear Route
                                </button>
                            </div>

                            <div className="bg-white-50 rounded-lg p-4 mb-6">
                                <h3 className="text-lg text-black mb-3">Route Statistics</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-black">Distance:</span>
                                        <span className="text-black">{distance} km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-black">Duration:</span>
                                        <span className="text-black">{duration}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-black">Pace:</span>
                                        <span className="text-black">{pace}/km</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-black">Points:</span>
                                        <span className="text-black">{routePoints.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-black">Route Type:</span>
                                        <span className="text-black text-xs">
                                            {isPathSnapped ? 'Path-Snapped' : 'Straight Lines'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pace: {pace}/km
                                    </label>
                                    <input
                                        type="range"
                                        min="3"
                                        max="12"
                                        step="0.1"
                                        value={sliderValue}
                                        onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>3:00/km</span>
                                        <span>12:00/km</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Activity Type
                                    </label>
                                    <select 
                                        value={activityType}
                                        onChange={(e) => setActivityType(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                                    >
                                        <option value="Running">Running</option>
                                        <option value="Cycling">Cycling</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Activity Name
                                    </label>
                                    <input
                                        type="text"
                                        value={activityName}
                                        onChange={(e) => setActivityName(e.target.value)}
                                        placeholder="Afternoon Run"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={activityDescription}
                                        onChange={(e) => setActivityDescription(e.target.value)}
                                        className="w-full h-36 border border-gray-300 rounded-md px-3 py-2 text-sm text-black resize-none"
                                        placeholder="Add a description for your route..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={activityDateTime}
                                        onChange={(e) => setActivityDateTime(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <button 
                                    onClick={downloadGPX}
                                    disabled={routePoints.length < 2}
                                    className="w-full bg-green-600 text-white px-4 py-3 rounded-md font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Download GPX
                                </button>
                                
                            </div>

                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <div ref={mapContainer} className="w-full h-full" />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg">
                            {routePoints.length < 2
                                ? `Click on the map to add points (${routePoints.length} points added)`
                                : isPathSnapped
                                    ? `Route snapped to paths (${routePoints.length} points)`
                                    : `${routePoints.length} points added - Click "Set to Path" to snap to roads`
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Strainva;