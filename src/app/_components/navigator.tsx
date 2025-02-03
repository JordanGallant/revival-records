import React from "react";
import { useRef, useState, useEffect } from "react";
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
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
} from "@heroui/react";

interface NavBarProps {
  className?: string;
}

const Navigator: React.FC<NavBarProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const songs = [
    "/music/song1.mp3",
    "/music/song2.mp3",
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

  const menuItems = ["Blog", "Music", "About", "Events"];

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarItem>
          <audio
            ref={audioRef}
            src={songs[currentSongIndex]} // Set the src to the current song
            onEnded={handleSongEnd} // Automatically move to the next song
          />
          <Button
            onTouchStart={handlePlayPause}
            id="play"
            className="w-10 h-10 flex justify-center items-center transition-none text-white"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>
      <NavbarItem>
        <audio
          ref={audioRef}
          src={songs[currentSongIndex]} // Set the src to the current song
          onEnded={handleSongEnd} // Automatically move to the next song
        />
        <Button
          onClick={handlePlayPause}
          id="play"
          className="hidden sm:flex w-10 h-10 justify-center items-center transition-none text-white"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </Button>
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
