"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;

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
        alpha: true, // Enable transparency
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

      const shape: THREE.Mesh[] = [];

      const geometry = new THREE.IcosahedronGeometry(2, 0);
      const material = new THREE.MeshLambertMaterial({
        color: 0x0064ff,
        emissive: 0x1111111,
      });

      const geometryFrame = new THREE.IcosahedronGeometry(4, 0);
      const materialFrame = new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        color: 0xffffff,
      });

      shape[0] = new THREE.Mesh(geometryFrame, materialFrame);
      shape[0].position.set(3, 5, 0);

      shape[1] = new THREE.Mesh(geometry, material);
      shape[1].position.set(3, 5, 0);

      scene.add(shape[0]);
      scene.add(shape[1]);

      const pointLight = new THREE.PointLight(0x888888);
      pointLight.position.set(1, 100, 500);
      scene.add(pointLight);

      camera.position.set(3, 5.5, 10); // x y z

      function render() {
        requestAnimationFrame(render);
        shape[0].rotation.x -= 0.005;
        shape[0].rotation.y -= 0.005;
        shape[1].rotation.x += 0.02;
        shape[1].rotation.y += 0.02;
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
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default ThreeScene;
