'use client';

import Image from 'next/image';
import Link from 'next/link';
import Navigator from '../_components/navigator';

const projects = [
  {
    title: 'Hand Tracking',
    image: 'https://i.ibb.co/kVhM3Ybr/Screenshot-2025-05-18-at-17-48-41.png',
    description: 'Media Pipe',
    url: '/media-pipe',
  },
  {
    title: 'Mcirosoft DOS',
    image: 'https://i.ibb.co/cXJv3Kjc/Screenshot-2025-05-18-at-17-49-37.png',
    description: 'jsdos',
    url: '/dos',
  },
  {
    title: 'Voice Sampler',
    image: 'https://i.ibb.co/jkrfrk7n/Screenshot-2025-05-18-at-17-49-12.png',
    description: 'Tone.js, Web Speech API',
    url: '/voice-sampler',
  },
  {
    title: 'DSP in the browser',
    image: 'https://i.ibb.co/wNynww0f/Screenshot-2025-05-18-at-17-57-49.png',
    description: 'Faust (WebAssembly)',
    url: '/effect/reverb',
  },
  {
    title: 'World Wide FM radio',
    image: 'https://i.ibb.co/fY0MQ49h/Screenshot-2025-05-19-at-09-48-28.png',
    description: 'Radio Garden, Howler.js',
    url: '/world-radio',
  },
  {
    title: 'Sleepy MP3 Downloader',
    image: 'https://i.ibb.co/xt3f90qQ/Screenshot-2025-05-19-at-10-01-18.png',
    description: 'Javascript (Browser Plugin)',
    url: 'https://github.com/JordanGallant/sleepy-mp3-downloader-plugin',
  },
  {
    title: 'Audio Reactive Particle System',
    image: 'https://i.ibb.co/rGDVbz7r/Screenshot-2025-05-19-at-15-02-00.png',
    description: 'tsparticles, Web Audio API',
    url: '/cymatics',
  },
  {
    title: 'Nintendo 64 Emulator',
    image: 'https://i.ibb.co/vvCgQ3Sb/Screenshot-2025-05-22-at-09-18-53.png',
    description: 'Web Assembly',
    url: '/n64',
  },
  {
    title: 'Web Synth',
    image: 'https://i.ibb.co/FqHWzZLm/Screenshot-2025-05-20-at-13-47-00.png',
    description: 'Tone.js, NexusUi',
    url: '/sleepy-synth',
  },
  {
    title: 'Movie Streamer',
    image: 'https://i.ibb.co/5X7GdhSg/Screenshot-2025-05-21-at-07-09-17.png',
    description: 'Movies Joy',
    url: '/movie',
  },
  {
    title: 'Flash Emulator',
    image: 'https://i.ibb.co/DDkv2WPJ/Screenshot-2025-05-21-at-07-34-08.png',
    description: 'Ruffle (Web Assembly)',
    url: '/flash',
  },
{
    title: 'Graffiti Translator',
    image: 'https://i.ibb.co/4Rg57wkz/Screenshot-2025-05-22-at-09-11-52.png',
    description: 'Canvas API, Google Vision ',
    url: '/graffiti',
  },
  {
    title: 'Sling Shot Music Game',
    image: 'https://i.ibb.co/7BSBSMp/Screenshot-2025-05-22-at-21-34-58.png',
    description: 'Matter.js, Tone.js',
    url: '/sling-shot',
  },
{
    title: 'Hallucinate Images',
    image: 'https://i.ibb.co/v6yvn534/dreamified-1747917536.jpg',
    description: 'Pytorch, Flask',
    url: '/hallucinate',
  },


  

];

export default function ProjectsGrid() {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Background Pixi trail */}
      <div className="absolute inset-0 z-0 pointer-events-none">
      </div>

      {/* Foreground content */}
      <div className="relative z-10">
        <Navigator />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-10 text-center text-white">Projects</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {projects.map((project, idx) => (
              <Link
                key={idx}
                href={project.url}
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold group-hover:text-indigo-600">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
