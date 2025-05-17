import React, { forwardRef, useImperativeHandle } from "react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

interface NavBarProps {
  audioRefs?: React.RefObject<HTMLAudioElement | null> | null; //force to accpet null
  onTrackChange?: (url: string, title: string) => void;
  onAudioElementCreated?: (audioElement: HTMLAudioElement) => void;

}

// Store bucket URL in environment variable
const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "https://revival-records.s3.amazonaws.com";

// Interface for song metadata
interface SongInfo {
  key: string;  // Original S3 key/path
  title: string; // Formatted title for display
  url: string;   // Full URL to the song
}

const Navigator = forwardRef<HTMLAudioElement, NavBarProps>((props, ref) => {


  // Check if the device is mobile
  const isMobileDevice = () => {
    return typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Navigation state
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Music player state
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (internalAudioRef.current && props.onAudioElementCreated) {
      // Call the callback with the audio element
      props.onAudioElementCreated(internalAudioRef.current);
    }
  }, [internalAudioRef.current, props.onAudioElementCreated]);
  useImperativeHandle(ref, () => internalAudioRef.current as HTMLAudioElement); //allow page to control internal audio ref
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());

  // Song list state
  const [songsList, setSongsList] = useState<SongInfo[]>([]);
  const [isPlaylistLoaded, setIsPlaylistLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Track list modal state
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load the song list on component mount
  useEffect(() => {
    fetchSongsList();
  }, []);







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
        // Transform the raw song keys into our SongInfo format
        const formattedSongs: SongInfo[] = data.songs.map((song: { title: string; url: string }) => ({
          key: song.title,
          title: extractSongTitle(song.title),
          url: song.url
        }));


        setSongsList(formattedSongs);
        setIsPlaylistLoaded(true);

        // Start with a random song if none is playing
        if (currentSongIndex === -1) {
          const randomIndex = Math.floor(Math.random() * formattedSongs.length);
          setCurrentSongIndex(randomIndex);
          // Note: We're not setting isPlaying to true here to prevent autoplay
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

  // Get the current song info
  const getCurrentSong = (): SongInfo | null => {
    if (currentSongIndex >= 0 && currentSongIndex < songsList.length) {
      return songsList[currentSongIndex];
    }
    return null;
  };

  const handlePlayPause = () => {
    const currentSong = getCurrentSong();
    if (!internalAudioRef.current || !currentSong) return;

    if (internalAudioRef.current.paused) {
      const playPromise = internalAudioRef.current.play();

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
      internalAudioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Play next song - either randomly (shuffle) or sequentially
  const playNextSong = () => {
    if (!isPlaylistLoaded || songsList.length === 0) return;

    setIsLoading(true);

    let nextIndex: number;

    if (isShuffleMode) {
      // In shuffle mode, try to play songs that haven't been played yet
      const currentSong = getCurrentSong();
      if (currentSong) {
        // Add current song to played songs
        setPlayedSongs(prev => new Set([...prev, currentSong.key]));
      }

      const unplayedSongs = songsList.filter(song => !playedSongs.has(song.key));

      // If all songs have been played, reset the played songs tracking
      if (unplayedSongs.length === 0) {
        const currentKey = currentSong?.key || '';
        setPlayedSongs(new Set([currentKey]));

        // Get all songs except the current one
        const availableSongs = songsList.filter(song => song.key !== currentKey);

        if (availableSongs.length > 0) {
          const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
          nextIndex = songsList.findIndex(song => song.key === randomSong.key);
        } else {
          // If there's only one song in the playlist, keep playing it
          nextIndex = currentSongIndex;
        }
      } else {
        // Pick a random song from unplayed songs
        const randomSong = unplayedSongs[Math.floor(Math.random() * unplayedSongs.length)];
        nextIndex = songsList.findIndex(song => song.key === randomSong.key);
      }
    } else {
      // In sequential mode, simply go to the next song in the list
      nextIndex = (currentSongIndex + 1) % songsList.length;
    }

    setCurrentSongIndex(nextIndex);
  };

  // Play a specific song by index
  const playSongByIndex = (index: number) => {
    if (index >= 0 && index < songsList.length) {
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  };

  // Handle song end - load the next song and continue playing automatically (except on mobile)
  const handleSongEnd = () => {
    const wasPlaying = isPlaying;
    playNextSong();

    // On mobile devices, we'll set isPlaying based on the previous state
    if (isMobileDevice()) {
      setIsPlaying(wasPlaying);
    }
  };

  // Toggle shuffle mode
  const toggleShuffleMode = () => {
    setIsShuffleMode(prev => !prev);
    // Reset played songs when shuffle mode changes
    setPlayedSongs(new Set());
  };

  // Handle force next - user clicked next button
  const handleForceNext = () => {
    // Keep track of whether we were playing
    const wasPlaying = isPlaying;

    if (isPlaying && internalAudioRef.current) {
      internalAudioRef.current.pause();
    }

    playNextSong();

    // If we were playing before, we'll try to keep playing
    if (wasPlaying) {
      setIsPlaying(true);
    }
  };

  // Handle loading events - auto play if we were previously playing (except on mobile)
  const handleCanPlay = () => {
    setIsLoading(false);

    // Auto-play the song if we were previously playing and not on mobile
    if (isPlaying && internalAudioRef.current && !isMobileDevice()) {
      const playPromise = internalAudioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Auto-play failed:", error);
          setIsPlaying(false);
        });
      }
    } else if (isPlaying && isMobileDevice()) {
      // On mobile, we don't auto-play but we keep the play state
      console.log("Auto-play skipped on mobile device");
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

    // Try to load the next song when there's an error
    const wasPlaying = isPlaying;
    setTimeout(() => {
      playNextSong();
      if (wasPlaying) {
        setIsPlaying(true);
      }
    }, 3000);
  };

  const menuItems = ["Blog", "Music", "About", "Events"];
  const currentSong = getCurrentSong();


  return (
    <>
      {currentSong && (
        <audio
          ref={internalAudioRef}
          src={currentSong.url}
          onEnded={handleSongEnd}
          onCanPlay={handleCanPlay}
          onError={handleError}
          preload="auto"
          crossOrigin="anonymous"
        />
      )}

      <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent className="sm:hidden" justify="start">
          <NavbarItem className="flex flex-row items-center gap-1">
            <Tooltip content={isPlaying ? "Pause" : "Play"}>
              <Button
                onTouchStart={handlePlayPause}
                onClick={handlePlayPause}
                id="play"
                className="w-10 h-10 flex justify-center items-center transition-none text-white"
                disabled={isLoading || !currentSong}
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
                className={`w-10 h-10 flex justify-center items-center transition-none text-white ${isShuffleMode ? "opacity-100" : "opacity-50"
                  }`}
              >
                <FaRandom />
              </Button>
            </Tooltip>
          </NavbarItem>

        </NavbarContent>

        <NavbarItem className="hidden sm:flex flex-row items-center gap-1">
          <div className="flex flex-row items-center">
            <Tooltip content={isPlaying ? "Pause" : "Play"}>
              <Button
                onClick={handlePlayPause}
                id="play"
                className="w-10 h-10 flex justify-center items-center transition-none text-white"
                disabled={isLoading || !currentSong}
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
                className={`w-10 h-10 flex justify-center items-center transition-none text-white ${isShuffleMode ? "opacity-100" : "opacity-50"
                  }`}
              >
                <FaRandom />
              </Button>
            </Tooltip>
            {currentSong && (
              <span className=" text-sm italic truncate max-w-64">
                {currentSong.title}
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
          <NavbarItem>
            <Link color="foreground" href="/listen">
              Listen
            </Link>
          </NavbarItem>
           <NavbarItem>
            <Link color="foreground" href="/song-list">
              List
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="/effect/reverb">
              Effects
            </Link>
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
    </>
  );
});

export default Navigator;