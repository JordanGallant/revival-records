'use client'
import React, { useEffect, useState, useRef } from "react";
import { Client, Room } from "colyseus.js";
import Navigator from "../_components/navigator";

interface RoomState {
  djId: string;
  isPlaying: boolean;
  currentSongIndex: number;
  playbackPosition: number;
  lastUpdateTime: number;
  isShuffleMode: boolean;
}

const N64: React.FC = () => {
  const [room, setRoom] = useState<Room<RoomState> | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isDJ, setIsDJ] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigatorRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Connect to Colyseus server
    const client = new Client("ws://localhost:2567"); // Replace with your server URL
    
    const connectToRoom = async () => {
      try {
        const joinedRoom = await client.joinOrCreate<RoomState>("my_room");
        setRoom(joinedRoom);
        setSessionId(joinedRoom.sessionId);
        setIsConnected(true);

        // Listen for state changes
        joinedRoom.onStateChange((state) => {
          setRoomState(state);
          setIsDJ(state.djId === joinedRoom.sessionId);
          
          // If we're a listener, sync with DJ's state
          if (state.djId !== joinedRoom.sessionId && navigatorRef.current) {
            syncWithDJState(state);
          }
        });

        joinedRoom.onLeave(() => {
          setIsConnected(false);
          setRoom(null);
        });

      } catch (error) {
        console.error("Failed to connect to room:", error);
      }
    };

    connectToRoom();

    return () => {
      room?.leave();
    };
  }, []);

  const syncWithDJState = (state: RoomState) => {
    if (!navigatorRef.current) return;

    // Sync play/pause state
    if (state.isPlaying && navigatorRef.current.paused) {
      navigatorRef.current.play().catch(console.error);
    } else if (!state.isPlaying && !navigatorRef.current.paused) {
      navigatorRef.current.pause();
    }

    // You'll need to expose methods from Navigator to handle song changes
    // This is where you'd trigger song changes for listeners
  };

  const handleDJPlayPause = () => {
    if (isDJ && room) {
      room.send("PLAY_PAUSE");
    }
  };

  const handleDJNextSong = (songIndex: number) => {
    if (isDJ && room) {
      room.send("NEXT_SONG", { songIndex });
    }
  };

  const handleDJToggleShuffle = () => {
    if (isDJ && room) {
      room.send("TOGGLE_SHUFFLE");
    }
  };

  if (!isConnected) {
    return <div>Connecting to listening room...</div>;
  }

  return (
    <>
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>Room Status: {isConnected ? "Connected" : "Disconnected"}</p>
        <p>Role: {isDJ ? "DJ" : "Listener"}</p>
        <p>Session ID: {sessionId}</p>
        {roomState && (
          <p>Current Song Index: {roomState.currentSongIndex}</p>
        )}
      </div>
      
      <Navigator 
        ref={navigatorRef}
        // You'll need to modify Navigator to accept these props
        isDJ={isDJ}
        onPlayPause={handleDJPlayPause}
        onNextSong={handleDJNextSong}
        onToggleShuffle={handleDJToggleShuffle}
      />
    </>
  );
};

export default N64;