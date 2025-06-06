'use client'
import React, { useState, useEffect, useRef } from "react";
import * as Colyseus from "colyseus.js";

const movieUrls = [
    {
        "name": "Swing Girls",
        "url": "https://vidsrc.xyz/embed/movie/tt0435434"
    },
    {
        "name": "Whiplash",
        "url": "https://vidsrc.xyz/embed/movie/tt2582802"
    },
    {
        "name": "Almost Famous",
        "url": "https://vidsrc.xyz/embed/movie/tt0181875"
    },
];

const Movie: React.FC = () => {
    const [currentMovie, setCurrentMovie] = useState(movieUrls[0]);
    const [isConnected, setIsConnected] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState<any[]>([]);
    const [roomId, setRoomId] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("Disconnected");
    const [syncMessage, setSyncMessage] = useState("");
    const [showSyncAlert, setShowSyncAlert] = useState(false);

    const roomRef = useRef<Colyseus.Room | null>(null);
    const clientRef = useRef<Colyseus.Client | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        // Initialize Colyseus client
        clientRef.current = new Colyseus.Client("wss://movie-viewer-tlcx.onrender.com");
        return () => {
            if (roomRef.current) {
                roomRef.current.leave();
            }
        };
    }, []);

    const joinRoom = async () => {
        if (!clientRef.current || !playerName.trim()) return;

        setIsJoining(true);
        setConnectionStatus("Connecting...");

        try {
            let room;
            if (roomId.trim()) {
                // Join existing room
                room = await clientRef.current.joinById(roomId.trim(), { name: playerName });
            } else {
                // Create new room
                room = await clientRef.current.create("MyRoom", { name: playerName });
                setRoomId(room.roomId);
            }

            roomRef.current = room;
            setIsConnected(true);
            setConnectionStatus("Connected");

            // Handle initial state
            room.onMessage("initialState", (message) => {
                setCurrentMovie({
                    name: message.movieName,
                    url: message.movieUrl
                });
                setIsHost(message.isHost);

                // Send sync request to get current playback state
                room.send("requestSync");
            });

            // Handle movie changes
            room.onMessage("movieChanged", (message) => {
                setCurrentMovie({
                    name: message.movieName,
                    url: message.movieUrl
                });

                // Reset iframe to load new movie
                if (iframeRef.current) {
                    iframeRef.current.src = message.movieUrl;
                }
            });

            // Handle sync messages
            room.onMessage("sync", (message) => {
                // Show sync notification
                const timeStr = Math.floor(message.currentTime / 60) + ":" +
                    String(Math.floor(message.currentTime % 60)).padStart(2, '0');
                setSyncMessage(`${message.isPlaying ? '▶️' : '⏸️'} Sync: ${timeStr} - Please manually sync your video!`);
                setShowSyncAlert(true);
                setTimeout(() => setShowSyncAlert(false), 5000);

                console.log("Sync received:", message);
            });

            // Handle new host assignment
            room.onMessage("newHost", (message) => {
                setIsHost(message.hostId === room.sessionId);
            });

            // Handle room state changes
            room.onStateChange((state) => {
                const playerArray = Array.from(state.players.values());
                setPlayers(playerArray);
            });

            room.onLeave(() => {
                setIsConnected(false);
                setConnectionStatus("Disconnected");
                setIsHost(false);
                setPlayers([]);
            });

        } catch (error) {
            console.error("Failed to join room:", error);
            setConnectionStatus("Connection failed");
        } finally {
            setIsJoining(false);
        }
    };

    const selectRandomMovie = () => {
        if (!roomRef.current || !isHost) return;
        roomRef.current.send("randomMovie");
    };

    const selectMovie = (index: number) => {
        if (!roomRef.current || !isHost) return;
        roomRef.current.send("changeMovie", { movieIndex: index });
    };

    const leaveRoom = () => {
        if (roomRef.current) {
            roomRef.current.leave();
        }
    };

    const broadcastSync = () => {
        if (!roomRef.current || !isHost) return;
        // For demonstration, we'll sync at current time (you'd get this from video player)
        const currentTime = Date.now() / 1000; // Placeholder
        roomRef.current.send("play", { currentTime: 0 }); // Reset to beginning
    };

    const requestSync = () => {
        if (!roomRef.current) return;
        roomRef.current.send("requestSync");
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
                    <h1 className="text-2xl font-bold mb-6 text-center">Join Movie Room</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Your Name</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Room ID (optional)</label>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                placeholder="Leave empty to create new room"
                            />
                        </div>

                        <button
                            onClick={joinRoom}
                            disabled={isJoining || !playerName.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
                        >
                            {isJoining ? "Connecting..." : (roomId.trim() ? "Join Room" : "Create Room")}
                        </button>

                        <p className="text-sm text-gray-400 text-center">Status: {connectionStatus}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white">Room: {roomRef.current?.roomId}</h1>
                    <p className="text-sm text-gray-400">
                        {isHost ? "You are the host" : "Waiting for host to control playback"}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-white">
                        Players: {players.length}/4
                    </div>
                    <button
                        onClick={leaveRoom}
                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                    >
                        Leave Room
                    </button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Main content */}
                <div className="flex-1 p-4">
                    <div className="flex flex-col items-center mb-4">
                        <h2 className="text-2xl font-bold text-white mb-4">Now showing: {currentMovie.name}</h2>

                        {isHost && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    onClick={selectRandomMovie}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                >
                                    Random Movie
                                </button>

                                <button
                                    onClick={() => broadcastSync()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                                >
                                    Sync Everyone
                                </button>

                                {movieUrls.map((movie, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectMovie(index)}
                                        className={`py-2 px-3 rounded text-sm ${movie.name === currentMovie.name
                                            ? 'bg-green-600'
                                            : 'bg-gray-600 hover:bg-gray-700'
                                            } text-white`}
                                    >
                                        {movie.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!isHost && (
                            <div className="mb-4">
                                <button
                                    onClick={() => requestSync()}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
                                >
                                    Request Sync
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-full aspect-video bg-black rounded overflow-hidden shadow-lg relative">
                        {showSyncAlert && (
                            <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white p-3 rounded shadow-lg z-10 flex items-center justify-between">
                                <span className="text-sm">{syncMessage}</span>
                                <button
                                    onClick={() => setShowSyncAlert(false)}
                                    className="text-white hover:text-gray-200 ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <iframe
                            ref={iframeRef}
                            src={currentMovie.url}
                            allowFullScreen
                            className="w-full h-full"
                        />
                    </div>
                </div>

                {/* Players sidebar */}
                <div className="w-64 bg-gray-800 p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Players</h3>
                    <div className="space-y-2">
                        {players.map((player) => (
                            <div key={player.sessionId} className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${player.isHost ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                <span className="text-white text-sm">
                                    {player.name} {player.isHost && '(Host)'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Movie;