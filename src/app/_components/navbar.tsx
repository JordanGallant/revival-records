import { useRef, useState } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { FaSoundcloud } from "react-icons/fa";


export default function NavBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Function to handle replay
  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset audio to the start
      audioRef.current.play(); // Play the audio again
      setIsPlaying(true); // Set isPlaying to true
    }
  };

  return (
    <Navbar className="w-screen">
      <NavbarItem>
        <audio
          ref={audioRef}
          src="/music/song.mp3"
          onEnded={handleReplay} // This will trigger replay when the audio ends
        />
        <Button onClick={handlePlayPause} className="w-10 h-10 flex justify-center items-center transition-none">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </Button>
      </NavbarItem>
      <NavbarBrand className="gap-10 w-screen">
        <p className="font-badeen text-5xl"> Revival Records</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-10 pl-10" justify="end">
        <NavbarItem>
          <Link color="foreground" href="#">
            Blog
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Music
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Events
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="https://soundcloud.com/jgsleepwithme">
          <FaSoundcloud className="w-10 h-10"/>
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {/* Add any additional content if needed */}
      </NavbarContent>
    </Navbar>
  );
}
