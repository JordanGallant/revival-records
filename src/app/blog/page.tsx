"use client";
import React from 'react';
import dynamic from "next/dynamic";
import Hydra from '../sketches/hydraComponent';


const P5Wrapper = dynamic(() => import("../_components/P5Wrapper"), { ssr: false });
const Blog: React.FC = () => {
  return (
    <div >
      <P5Wrapper sketch={Hydra} />
    </div>
  );
};

export default Blog;
