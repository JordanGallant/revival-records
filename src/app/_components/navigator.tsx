import React from "react";
import { useRef, useState, useEffect } from "react";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaRandom } from "react-icons/fa";
import { FaStepForward } from "react-icons/fa";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Tooltip,
} from "@heroui/react";

interface NavBarProps {
  className?: string;
}

// Store bucket URL in environment variable
const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "https://revival-records.s3.amazonaws.com";

const Navigator: React.FC<NavBarProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
  const [currentSongTitle, setCurrentSongTitle] = useState<string>("");
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  
  // Song list from API
  const [songsList, setSongsList] = useState<string[]>([]);
  const [isPlaylistLoaded, setIsPlaylistLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load the song list on component mount
  useEffect(() => {
    fetchSongsList();
  }, []);

  // Helper function to get a proxied S3 URL
  const getProxiedUrl = (s3Path: string): string => {
    const originalUrl = `${S3_BUCKET_URL}/${s3Path}`;
    const encodedUrl = encodeURIComponent(originalUrl);
    return `/api/proxy?url=${encodedUrl}`;
  };

  // Function to fetch songs list from the API
  const fetchSongsList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/songs');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data.songs) && data.songs.length > 0) {
        setSongsList(data.songs);
        setIsPlaylistLoaded(true);

        // Start with a random song if none is playing
        if (!currentSongUrl) {
          const randomIndex = Math.floor(Math.random() * data.songs.length);
          const songPath = data.songs[randomIndex];
          
          // Use the proxy instead of direct S3 URL
          const proxyUrl = getProxiedUrl(songPath);
          
          setCurrentSongUrl(proxyUrl);
          setCurrentSongTitle(extractSongTitle(data.songs[randomIndex]));
        }
      } else {
        setFetchError("No songs found in the bucket");
      }
    } catch (error) {
      console.error("Error fetching songs list:", error);
      setFetchError(error instanceof Error ? error.message : "Error fetching songs");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract a display title from the filename
  const extractSongTitle = (filename: string): string => {
    // Remove file extension and replace underscores/hyphens with spaces
    return filename
      .replace(/\.(mp3|wav|ogg|flac|m4a)$/i, "")
      .replace(/[_-]/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentSongUrl) return;
    
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
          });
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Play next song - either randomly (shuffle) or sequentially
  const playNextSong = () => {
    if (!isPlaylistLoaded || songsList.length === 0) return;
    
    setIsLoading(true);
    
    let nextSongFilename: string;
    
    if (isShuffleMode) {
      // In shuffle mode, try to play songs that haven't been played yet
      const unplayedSongs = songsList.filter(song => {
        // Get the proxied URL to track played songs
        const proxyUrl = getProxiedUrl(song);
        return !playedSongs.has(proxyUrl);
      });
      
      // If all songs have been played, reset the played songs tracking
      if (unplayedSongs.length === 0) {
        setPlayedSongs(new Set([currentSongUrl!]));
        const remainingSongs = songsList.filter(song => {
          const proxyUrl = getProxiedUrl(song);
          return proxyUrl !== currentSongUrl;
        });
        nextSongFilename = remainingSongs[Math.floor(Math.random() * remainingSongs.length)];
      } else {
        nextSongFilename = unplayedSongs[Math.floor(Math.random() * unplayedSongs.length)];
      }
    } else {
      // In sequential mode, find the current song's index and play the next one
      // Extract the original filename from the proxy URL
      const currentUrlParams = new URLSearchParams(
        currentSongUrl?.split('?')[1] || ''
      );
      const encodedOriginalUrl = currentUrlParams.get('url') || '';
      const originalUrl = decodeURIComponent(encodedOriginalUrl);
      const currentFilename = originalUrl.replace(`${S3_BUCKET_URL}/`, "");
      
      let currentIndex = songsList.findIndex(song => song === currentFilename);
      
      // If we couldn't find it, use a fallback
      if (currentIndex === -1) {
        console.warn("Couldn't find current song in list, defaulting to first song");
        currentIndex = 0;
      }
      
      const nextIndex = (currentIndex + 1) % songsList.length;
      nextSongFilename = songsList[nextIndex];
    }
    
    // Use the proxy URL
    const proxyUrl = getProxiedUrl(nextSongFilename);
    
    console.log("Playing next song:", nextSongFilename);
    
    setCurrentSongUrl(proxyUrl);
    setCurrentSongTitle(extractSongTitle(nextSongFilename));
    
    // Add to played songs
    setPlayedSongs(prev => new Set([...prev, proxyUrl]));
  };

  // Handle song end - play the next song
  const handleSongEnd = () => {
    playNextSong();
  };

  // Toggle shuffle mode
  const toggleShuffleMode = () => {
    setIsShuffleMode(prev => !prev);
  };

  // Handle force next - user clicked next button
  const handleForceNext = () => {
    playNextSong();
  };

  // Handle loading events
  const handleCanPlay = () => {
    setIsLoading(false);
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Auto-play failed:", error);
        setIsPlaying(false);
      });
    }
  };

  // Handle errors loading audio from S3
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("Error loading audio:", e);
    setIsLoading(false);
    setIsPlaying(false);
    
    // Log more details about the error
    const audioElement = e.target as HTMLAudioElement;
    const errorCode = audioElement.error ? audioElement.error.code : "No error code available";
    const errorMsg = audioElement.error ? audioElement.error.message : "No error message";
    
    console.log("Audio error details:", {
      src: audioElement.src,
      error: errorCode,
      message: errorMsg
    });
    
    // Try playing the next song if there was an error after a short delay
    setTimeout(playNextSong, 3000);
  };

  const menuItems = ["Blog", "Music", "About", "Events"];

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarItem className="flex flex-row items-center gap-1">
          {currentSongUrl && (
            <audio
              ref={audioRef}
              src={currentSongUrl}
              onEnded={handleSongEnd}
              onCanPlay={handleCanPlay}
              onError={handleError}
              preload="auto"
            />
          )}
          
          <Tooltip content={isPlaying ? "Pause" : "Play"}>
            <Button
              onTouchStart={handlePlayPause}
              onClick={handlePlayPause}
              id="play"
              className="w-10 h-10 flex justify-center items-center transition-none text-white"
              disabled={isLoading || !currentSongUrl}
            >
              {isLoading ? "..." : isPlaying ? <FaPause /> : <FaPlay />}
            </Button>
          </Tooltip>
          
          <Tooltip content="Next Song">
            <Button
              onTouchStart={handleForceNext}
              onClick={handleForceNext}
              className="w-10 h-10 flex justify-center items-center transition-none text-white"
              disabled={isLoading || !isPlaylistLoaded}
            >
              <FaStepForward />
            </Button>
          </Tooltip>
          
          <Tooltip content={isShuffleMode ? "Sequential Play" : "Shuffle Play"}>
            <Button
              onClick={toggleShuffleMode}
              className={`w-10 h-10 flex justify-center items-center transition-none text-white ${
                isShuffleMode ? "opacity-100" : "opacity-50"
              }`}
            >
              <FaRandom />
            </Button>
          </Tooltip>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>
      
      <NavbarItem className="hidden sm:flex flex-row items-center gap-1">
        {currentSongUrl && (
          <audio
            ref={audioRef}
            src={currentSongUrl}
            onEnded={handleSongEnd}
            onCanPlay={handleCanPlay}
            onError={handleError}
            preload="auto"
          />
        )}
        
        <div className="flex flex-row items-center">
          <Tooltip content={isPlaying ? "Pause" : "Play"}>
            <Button
              onClick={handlePlayPause}
              id="play"
              className="w-10 h-10 flex justify-center items-center transition-none text-white"
              disabled={isLoading || !currentSongUrl}
            >
              {isLoading ? "..." : isPlaying ? <FaPause /> : <FaPlay />}
            </Button>
          </Tooltip>
          
          <Tooltip content="Next Song">
            <Button
              onClick={handleForceNext}
              className="w-10 h-10 flex justify-center items-center transition-none text-white"
              disabled={isLoading || !isPlaylistLoaded}
            >
              <FaStepForward />
            </Button>
          </Tooltip>
          
          <Tooltip content={isShuffleMode ? "Sequential Play" : "Shuffle Play"}>
            <Button
              onClick={toggleShuffleMode}
              className={`w-10 h-10 flex justify-center items-center transition-none text-white ${
                isShuffleMode ? "opacity-100" : "opacity-50"
              }`}
            >
              <FaRandom />
            </Button>
          </Tooltip>
          
          {currentSongTitle && (
            <span className="ml-2 text-sm italic truncate max-w-28">
              {currentSongTitle}
            </span>
          )}
        </div>
      </NavbarItem>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link href="/">
            <p className="font-badeen"> Revival Records</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarBrand>
          <Link href="/">
            <p className="font-badeen"> Revival Records</p>
          </Link>
        </NavbarBrand>
        <NavbarItem>
          <Link color="foreground" href="blog">
            Blog
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="/music">
            Music
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/about">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/events">
            Events
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="warning" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2
                  ? "warning"
                  : index === menuItems.length - 1
                  ? "danger"
                  : "foreground"
              }
              href={item.toLowerCase()}
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
};

export default Navigator;