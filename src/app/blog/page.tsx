"use client";
import React from 'react';
import dynamic from "next/dynamic";
import HydraCanvas from "../shaders/Hydra"


const Blog: React.FC = () => {
  return (
    <div >
      <HydraCanvas/>

    </div>
  );
};

export default Blog;
