"use client";
import NavBar from "./_components/navbar";
import dynamic from 'next/dynamic';
import exampleSketch from './sketches/exampleSketch';


const P5Wrapper = dynamic(() => import('../app/_components/P5Wrapper'), { ssr: false });
export default function Home() {
  return (
    <>
    <div className="w-screen">
     <NavBar/>
    </div>

    <div className= "w-screen min-h-screen bg-orange-500	" 	>
    <P5Wrapper sketch={exampleSketch} />
    </div>
    </>
  );
} 
