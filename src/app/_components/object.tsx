"use client";

import * as THREE from "three";
import { useEffect, useRef, useState } from "react";



const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [invertRotation, setInvertRotation] = useState(false); // State to track rotation inversion

  useEffect(() => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let face: THREE.Mesh;

    function init() {
      if (!containerRef.current) return;

      const scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        50,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );

      renderer = new THREE.WebGLRenderer({
        alpha: true, // Enable transparency for the background
      });

      renderer.setClearColor(0x000000, 0); // Set transparent background
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.zIndex = "1";
      renderer.domElement.style.top = "0";
      containerRef.current.appendChild(renderer.domElement);

      // Add an environment map for reflections
      const cubeTextureLoader = new THREE.CubeTextureLoader();
      const environmentMap = cubeTextureLoader.load([
        "/textures/eyeball.jpg", // Replace with your texture paths
        "/textures/moon.jpg"
      ]);

      scene.environment = environmentMap;

      // Load moon texture
      const textureLoader = new THREE.TextureLoader();
      const moonTexture = textureLoader.load("/textures/moon.jpg"); // Replace with your moon texture path

      // Create the face (metallic sphere with moon texture)
      const faceGeometry = new THREE.SphereGeometry(3, 32, 32);
      const faceMaterial = new THREE.MeshPhysicalMaterial({
        envMap: environmentMap, // Use the environment map for reflections
        map: moonTexture, // Apply the moon texture
      });
      face = new THREE.Mesh(faceGeometry, faceMaterial);
      scene.add(face);

      // Lighting
      const pointLight = new THREE.PointLight(0xffffff, 1.5);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(-10, 10, 10);
      scene.add(directionalLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      camera.position.set(0, 0, 10);

      
    

      function render() {
        requestAnimationFrame(render);

       

        // Rotate the face in the opposite direction if inversion is active
        if (invertRotation) {
          face.rotation.x -= 0.02; // Inverse rotation on X-axis
          face.rotation.y -= 0.02; // Inverse rotation on Y-axis
        } 
        
        
        else {
          face.rotation.x += 0.02; // Normal rotation on X-axis
          face.rotation.y += 0.02; // Normal rotation on Y-axis
        }

        // Render the scene
        renderer.render(scene, camera);
      }

      render();

      // Handle window resize
      function onResize() {
        if (!containerRef.current) return;

        camera.aspect =
          containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      };
    }

    init();
  }, [invertRotation]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ThreeScene;
