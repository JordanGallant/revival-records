import { useRef, useState, useEffect } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaSoundcloud } from "react-icons/fa";

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {


  // List of songs (change the paths to your actual song files)
  const songs = [
   // "/music/song1.mp3",
   // "/music/song2.mp3",
    "/music/song3.mp3",
    "/music/song4.mp3",
    "/music/song5.mp3",
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };  

  // Function to handle replay and move to the next song when the current one ends
  const handleSongEnd = () => {
    const nextSongIndex = (currentSongIndex + 1) % songs.length; // Loop to the next song
    setCurrentSongIndex(nextSongIndex); // Update the song index to the next song
  };

  // Automatically trigger play for the next song when current one ends
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSongIndex]); // Effect runs when the song changes

  return (
    <Navbar className="w-screen bg-opacity-75 bg-white">
      <NavbarItem>
        <audio
          ref={audioRef}
          src={songs[currentSongIndex]} // Set the src to the current song
          onEnded={handleSongEnd} // Automatically move to the next song
        />
        <Button
          onClick={handlePlayPause}
          id="play"
          className="w-10 h-10 flex justify-center items-center transition-none"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </Button>
      </NavbarItem>
      <NavbarBrand className="gap-10 w-screen">
        <p className="font-badeen text-5xl"> Revival Records</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-10 pl-10" justify="end">
        <NavbarItem>
        <Link href="/blog">
        <a >Blog</a>
        </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="/music">
            Music
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/listen">
            Events
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="https://soundcloud.com/jgsleepwithme">
            <FaSoundcloud className="w-10 h-10" />
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {/* Add any additional content if needed */}
      </NavbarContent>
    </Navbar>
  );
}


export default NavBar;
