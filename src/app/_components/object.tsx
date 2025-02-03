"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [invertRotation, setInvertRotation] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let face: THREE.Mesh;
    const scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const moonTexture = textureLoader.load("/textures/moon.jpg");

    const faceGeometry = new THREE.SphereGeometry(3, 32, 32);
    const faceMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
    face = new THREE.Mesh(faceGeometry, faceMaterial);
    scene.add(face);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    function render() {
      requestAnimationFrame(render);
      face.rotation.x += invertRotation ? -0.02 : 0.02;
      face.rotation.y += invertRotation ? -0.02 : 0.02;
      renderer.render(scene, camera);
    }

    render();

    function onResize() {
      if (!containerRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [invertRotation]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ThreeScene;
