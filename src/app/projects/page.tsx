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
